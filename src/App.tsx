import { useState } from "react";
import { useTranslation } from "react-i18next";
import psl from "psl";
import "./App.css";

type ConvertMode = "as-is" | "sort" | "group";

function App() {
  const { t, i18n } = useTranslation();
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [convertMode, setConvertMode] = useState<ConvertMode>("as-is");

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
            const count = domainItems.length;
            const header = `# ${domain} - ${count} URL${count !== 1 ? "s" : ""}`;
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
                onChange={(e) => setConvertMode(e.target.value as ConvertMode)}
              />
              <span>{t("modes.asIs")}</span>
            </label>
            <label className="radio-label">
              <input
                type="radio"
                name="convertMode"
                value="sort"
                checked={convertMode === "sort"}
                onChange={(e) => setConvertMode(e.target.value as ConvertMode)}
              />
              <span>{t("modes.sort")}</span>
            </label>
            <label className="radio-label">
              <input
                type="radio"
                name="convertMode"
                value="group"
                checked={convertMode === "group"}
                onChange={(e) => setConvertMode(e.target.value as ConvertMode)}
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
