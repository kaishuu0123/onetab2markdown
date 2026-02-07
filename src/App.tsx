import { useState } from "react";
import { useTranslation } from "react-i18next";
import psl from "psl";
import "./App.css";

type ConvertMode = "as-is" | "sort" | "group";
type TabMode = "convert" | "triage";
type TriageAction = "keep" | "later" | "delete";

interface TriageItem {
  url: string;
  title: string;
  action?: TriageAction;
}

function App() {
  const { t, i18n } = useTranslation();
  const [tabMode, setTabMode] = useState<TabMode>("convert");
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [convertMode, setConvertMode] = useState<ConvertMode>("as-is");

  // Triage mode state
  const [triageItems, setTriageItems] = useState<TriageItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [triageStarted, setTriageStarted] = useState(false);

  // デバッグ用
  console.log("Current language:", i18n.language);
  console.log("Translation test:", t("app.title"));

  const extractDomain = (url: string): string => {
    try {
      const urlObj = new URL(url);
      const parsed = psl.parse(urlObj.hostname);

      if (parsed.error) {
        return urlObj.hostname.replace("www.", "");
      }

      return parsed.domain || urlObj.hostname.replace("www.", "");
    } catch {
      return "unknown";
    }
  };

  const convertToMarkdown = () => {
    const lines = input
      .trim()
      .split("\n")
      .filter((line) => line.trim());

    // URL情報を抽出
    const items = lines
      .map((line) => {
        const parts = line.split(" | ");
        if (parts.length >= 2) {
          const url = parts[0].trim();
          const title = parts.slice(1).join(" | ").trim();
          const domain = extractDomain(url);
          return { url, title, domain };
        }
        return null;
      })
      .filter(
        (item): item is { url: string; title: string; domain: string } =>
          item !== null,
      );

    let result = "";

    switch (convertMode) {
      case "as-is":
        // そのまま（入力順）
        result = items
          .map(({ url, title }) => `- [${title}](${url})`)
          .join("\n");
        break;

      case "sort": {
        // ドメインごとにソート
        const sorted = [...items].sort((a, b) => {
          const domainCompare = a.domain.localeCompare(b.domain);
          if (domainCompare !== 0) return domainCompare;
          return a.url.localeCompare(b.url);
        });
        result = sorted
          .map(({ url, title }) => `- [${title}](${url})`)
          .join("\n");
        break;
      }

      case "group": {
        // ドメインごとにグループ化
        const grouped: Record<
          string,
          Array<{ url: string; title: string }>
        > = {};

        items.forEach(({ url, title, domain }) => {
          if (!grouped[domain]) {
            grouped[domain] = [];
          }
          grouped[domain].push({ url, title });
        });

        result = Object.entries(grouped)
          .sort(([domainA], [domainB]) => domainA.localeCompare(domainB))
          .map(([domain, domainItems]) => {
            const header = `# ${domain}_${domainItems.length}件`;
            const links = domainItems
              .map(({ url, title }) => `- [${title}](${url})`)
              .join("\n");
            return `${header}\n${links}`;
          })
          .join("\n\n");
        break;
      }
    }

    setOutput(result);
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(output);
      alert(t("messages.copied"));
    } catch (err) {
      alert(t("messages.copyFailed"));
    }
  };

  // Triage functions
  const startTriage = () => {
    const lines = input
      .trim()
      .split("\n")
      .filter((line) => line.trim());
    const items: TriageItem[] = lines
      .map((line) => {
        const parts = line.split(" | ");
        if (parts.length >= 2) {
          return {
            url: parts[0].trim(),
            title: parts.slice(1).join(" | ").trim(),
          };
        }
        return null;
      })
      .filter((item): item is TriageItem => item !== null);

    setTriageItems(items);
    setCurrentIndex(0);
    setTriageStarted(true);
  };

  const handleTriageAction = (action: TriageAction) => {
    const updatedItems = [...triageItems];
    updatedItems[currentIndex] = { ...updatedItems[currentIndex], action };
    setTriageItems(updatedItems);

    if (currentIndex < triageItems.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      // All items processed, generate output
      finishTriage(updatedItems);
    }
  };

  const finishTriage = (items: TriageItem[]) => {
    const kept = items.filter((item) => item.action === "keep");
    const later = items.filter((item) => item.action === "later");

    let result = "";

    if (kept.length > 0) {
      result += "# Keep\n";
      result += kept.map(({ url, title }) => `- [${title}](${url})`).join("\n");
      result += "\n\n";
    }

    if (later.length > 0) {
      result += "# Later\n";
      result += later
        .map(({ url, title }) => `- [${title}](${url})`)
        .join("\n");
    }

    setOutput(result.trim());
    setTriageStarted(false);
  };

  const resetTriage = () => {
    setTriageItems([]);
    setCurrentIndex(0);
    setTriageStarted(false);
    setInput("");
    setOutput("");
  };

  const copyListToClipboard = async (
    category: TriageAction | "pending",
    format: "markdown" | "onetab",
  ) => {
    let items: TriageItem[] = [];

    if (category === "pending") {
      items = triageItems.filter((item) => !item.action);
    } else {
      items = triageItems.filter((item) => item.action === category);
    }

    if (items.length === 0) return;

    let text = "";
    if (format === "markdown") {
      text = items.map(({ url, title }) => `- [${title}](${url})`).join("\n");
    } else {
      // OneTab format: URL | Title
      text = items.map(({ url, title }) => `${url} | ${title}`).join("\n");
    }

    try {
      await navigator.clipboard.writeText(text);
      alert(t("messages.copied"));
    } catch (err) {
      alert(t("messages.copyFailed"));
    }
  };

  return (
    <div className="container">
      <header>
        <h1>{t("app.title")}</h1>
        <div className="language-selector">
          <span className="language-label">{t("settings.language")}</span>
          <label className="language-option">
            <input
              type="radio"
              name="language"
              value="ja"
              checked={i18n.language === "ja"}
              onChange={() => i18n.changeLanguage("ja")}
            />
            <span>日本語</span>
          </label>
          <label className="language-option">
            <input
              type="radio"
              name="language"
              value="en"
              checked={i18n.language === "en"}
              onChange={() => i18n.changeLanguage("en")}
            />
            <span>English</span>
          </label>
        </div>
        <p className="description">{t("app.description")}</p>
      </header>

      {/* Tab Navigation */}
      <div className="tabs">
        <button
          className={`tab ${tabMode === "convert" ? "active" : ""}`}
          onClick={() => setTabMode("convert")}
        >
          {t("tabs.convert")}
        </button>
        <button
          className={`tab ${tabMode === "triage" ? "active" : ""}`}
          onClick={() => setTabMode("triage")}
        >
          {t("tabs.triage")}
        </button>
      </div>

      {/* Convert Tab */}
      {tabMode === "convert" && (
        <div className="content">
          <div className="panel">
            <h2>{t("sections.onetab")}</h2>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={t("placeholder.input")}
              rows={20}
            />
          </div>

          <div className="controls">
            <div className="mode-selector">
              <label className="radio-label">
                <input
                  type="radio"
                  name="convertMode"
                  value="as-is"
                  checked={convertMode === "as-is"}
                  onChange={(e) =>
                    setConvertMode(e.target.value as ConvertMode)
                  }
                />
                <span>{t("modes.asIs")}</span>
              </label>
              <label className="radio-label">
                <input
                  type="radio"
                  name="convertMode"
                  value="sort"
                  checked={convertMode === "sort"}
                  onChange={(e) =>
                    setConvertMode(e.target.value as ConvertMode)
                  }
                />
                <span>{t("modes.sort")}</span>
              </label>
              <label className="radio-label">
                <input
                  type="radio"
                  name="convertMode"
                  value="group"
                  checked={convertMode === "group"}
                  onChange={(e) =>
                    setConvertMode(e.target.value as ConvertMode)
                  }
                />
                <span>{t("modes.group")}</span>
              </label>
            </div>
            <button onClick={convertToMarkdown} className="convert-btn">
              {t("buttons.convert")}
            </button>
          </div>

          <div className="panel">
            <div className="panel-header">
              <h2>{t("sections.markdown")}</h2>
              <button
                onClick={copyToClipboard}
                className="copy-btn"
                disabled={!output}
              >
                {t("buttons.copy")}
              </button>
            </div>
            <textarea
              value={output}
              readOnly
              placeholder={t("placeholder.output")}
              rows={20}
            />
          </div>
        </div>
      )}

      {/* Triage Tab */}
      {tabMode === "triage" && (
        <div className="content">
          {!triageStarted ? (
            <div className="triage-setup">
              <div className="panel">
                <h2>{t("triage.pasteUrls")}</h2>
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={t("placeholder.input")}
                  rows={20}
                />
              </div>
              <button
                onClick={startTriage}
                className="convert-btn"
                disabled={!input.trim()}
              >
                {t("triage.start")}
              </button>
            </div>
          ) : currentIndex < triageItems.length ? (
            <div className="triage-view">
              <div className="triage-stats">
                <div className="stat-item keep">
                  <span className="stat-icon">👍</span>
                  <span className="stat-label">{t("triage.keep")}</span>
                  <span className="stat-count">
                    {
                      triageItems.filter((item) => item.action === "keep")
                        .length
                    }
                  </span>
                </div>
                <div className="stat-item later">
                  <span className="stat-icon">⏭️</span>
                  <span className="stat-label">{t("triage.later")}</span>
                  <span className="stat-count">
                    {
                      triageItems.filter((item) => item.action === "later")
                        .length
                    }
                  </span>
                </div>
                <div className="stat-item delete">
                  <span className="stat-icon">🗑️</span>
                  <span className="stat-label">{t("triage.delete")}</span>
                  <span className="stat-count">
                    {
                      triageItems.filter((item) => item.action === "delete")
                        .length
                    }
                  </span>
                </div>
                <div className="stat-item pending">
                  <span className="stat-icon">📋</span>
                  <span className="stat-label">{t("triage.pending")}</span>
                  <span className="stat-count">
                    {triageItems.length - currentIndex}
                  </span>
                </div>
              </div>

              <div className="triage-card">
                <div className="triage-card-content">
                  <h2 className="triage-title">
                    {triageItems[currentIndex].title}
                  </h2>
                  <a
                    href={triageItems[currentIndex].url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="triage-url"
                  >
                    {triageItems[currentIndex].url}
                  </a>
                </div>
              </div>

              <div className="triage-actions">
                <button
                  onClick={() => handleTriageAction("keep")}
                  className="triage-btn keep"
                >
                  👍 {t("triage.keep")}
                </button>
                <button
                  onClick={() => handleTriageAction("later")}
                  className="triage-btn later"
                >
                  ⏭️ {t("triage.later")}
                </button>
                <button
                  onClick={() => handleTriageAction("delete")}
                  className="triage-btn delete"
                >
                  🗑️ {t("triage.delete")}
                </button>
              </div>

              {/* Lists Section */}
              <div className="triage-lists">
                {triageItems.filter((item) => item.action === "keep").length >
                  0 && (
                  <div className="triage-list keep">
                    <div className="list-header">
                      <h3>
                        👍 {t("triage.keep")} (
                        {
                          triageItems.filter((item) => item.action === "keep")
                            .length
                        }
                        )
                      </h3>
                      <div className="copy-buttons">
                        <button
                          className="copy-list-btn markdown"
                          onClick={() =>
                            copyListToClipboard("keep", "markdown")
                          }
                        >
                          {t("buttons.copyMarkdown")}
                        </button>
                        <button
                          className="copy-list-btn onetab"
                          onClick={() => copyListToClipboard("keep", "onetab")}
                        >
                          {t("buttons.copyOneTab")}
                        </button>
                      </div>
                    </div>
                    <ul>
                      {triageItems
                        .filter((item) => item.action === "keep")
                        .map((item, idx) => (
                          <li key={idx}>
                            <a
                              href={item.url}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              {item.title}
                            </a>
                          </li>
                        ))}
                    </ul>
                  </div>
                )}

                {triageItems.filter((item) => item.action === "later").length >
                  0 && (
                  <div className="triage-list later">
                    <div className="list-header">
                      <h3>
                        ⏭️ {t("triage.later")} (
                        {
                          triageItems.filter((item) => item.action === "later")
                            .length
                        }
                        )
                      </h3>
                      <div className="copy-buttons">
                        <button
                          className="copy-list-btn markdown"
                          onClick={() =>
                            copyListToClipboard("later", "markdown")
                          }
                        >
                          {t("buttons.copyMarkdown")}
                        </button>
                        <button
                          className="copy-list-btn onetab"
                          onClick={() => copyListToClipboard("later", "onetab")}
                        >
                          {t("buttons.copyOneTab")}
                        </button>
                      </div>
                    </div>
                    <ul>
                      {triageItems
                        .filter((item) => item.action === "later")
                        .map((item, idx) => (
                          <li key={idx}>
                            <a
                              href={item.url}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              {item.title}
                            </a>
                          </li>
                        ))}
                    </ul>
                  </div>
                )}

                {triageItems.filter((item) => item.action === "delete").length >
                  0 && (
                  <div className="triage-list delete">
                    <div className="list-header">
                      <h3>
                        🗑️ {t("triage.delete")} (
                        {
                          triageItems.filter((item) => item.action === "delete")
                            .length
                        }
                        )
                      </h3>
                      <div className="copy-buttons">
                        <button
                          className="copy-list-btn markdown"
                          onClick={() =>
                            copyListToClipboard("delete", "markdown")
                          }
                        >
                          {t("buttons.copyMarkdown")}
                        </button>
                        <button
                          className="copy-list-btn onetab"
                          onClick={() =>
                            copyListToClipboard("delete", "onetab")
                          }
                        >
                          {t("buttons.copyOneTab")}
                        </button>
                      </div>
                    </div>
                    <ul>
                      {triageItems
                        .filter((item) => item.action === "delete")
                        .map((item, idx) => (
                          <li key={idx}>
                            <span className="deleted-item">{item.title}</span>
                          </li>
                        ))}
                    </ul>
                  </div>
                )}

                {triageItems.filter((item) => !item.action).length > 0 && (
                  <div className="triage-list pending">
                    <div className="list-header">
                      <h3>
                        📋 {t("triage.pending")} (
                        {triageItems.filter((item) => !item.action).length})
                      </h3>
                      <div className="copy-buttons">
                        <button
                          className="copy-list-btn markdown"
                          onClick={() =>
                            copyListToClipboard("pending", "markdown")
                          }
                        >
                          {t("buttons.copyMarkdown")}
                        </button>
                        <button
                          className="copy-list-btn onetab"
                          onClick={() =>
                            copyListToClipboard("pending", "onetab")
                          }
                        >
                          {t("buttons.copyOneTab")}
                        </button>
                      </div>
                    </div>
                    <ul>
                      {triageItems
                        .filter((item) => !item.action)
                        .map((item, idx) => (
                          <li key={idx}>
                            <a
                              href={item.url}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              {item.title}
                            </a>
                          </li>
                        ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="triage-complete">
              <h2>{t("triage.complete")}</h2>
              <div className="panel">
                <div className="panel-header">
                  <h3>{t("sections.markdown")}</h3>
                  <button onClick={copyToClipboard} className="copy-btn">
                    {t("buttons.copy")}
                  </button>
                </div>
                <textarea value={output} readOnly rows={20} />
              </div>
              <button onClick={resetTriage} className="convert-btn">
                {t("triage.reset")}
              </button>
            </div>
          )}
        </div>
      )}

      <footer>
        <a
          href="https://github.com/kaishuu0123/onetab2markdown"
          target="_blank"
          rel="noopener noreferrer"
        >
          {t("footer.github")}
        </a>
      </footer>
    </div>
  );
}

export default App;
