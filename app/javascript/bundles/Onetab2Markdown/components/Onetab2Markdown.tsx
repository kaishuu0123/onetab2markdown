import React, { useEffect, useState } from 'react'
import { Input, Label } from 'reactstrap'
import ReactOnRails from 'react-on-rails'

interface ConvertResponse {
  markdownText: string
}

const useDebounce = (value: string, delay: number): string => {
  const [debouncedValue, setDebouncedValue] = useState(value)

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(timer)
    }
  }, [value, delay])

  return debouncedValue
}

const OneTab2Markdown: React.FC = (_prop) => {
  const [onetabText, setOneTabText] = useState<string>('')
  const [markdownText, setMarkdownText] = useState<string>('')
  const debouncedValue = useDebounce(onetabText, 500)

  useEffect(() => {
    if (onetabText === '') {
      return
    }

    const getMarkdownText = async (): Promise<void> => {
      try {
        const headers = ReactOnRails.authenticityHeaders({
          'Content-Type': 'application/json'
        })
        const path = 'convert'
        const options = {
          method: 'POST',
          headers,
          body: JSON.stringify({ text: onetabText })
        }
        const response = await fetch(path, options)
        const json = (await response.json()) as ConvertResponse
        if (json == null) {
          return
        }
        setMarkdownText(json.markdownText)
      } catch (error) {
        console.log(error)
      }
    }

    getMarkdownText()
      .then(() => {})
      .catch((err) => {
        console.error(err)
      })
  }, [debouncedValue])

  const onTextChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const value = e?.target?.value
    if (value == null || typeof value !== 'string') {
      return
    }

    setOneTabText(value)
  }

  return (
    <div className="container">
      <div className="row">
        <div className="col-12">
          <div className="alert alert-info" role="alert">
            OneTab の「URLの読み込み/書き出し」からコピーしたテキストをドメイン別に振り分けて
            markdown 化するツールです
          </div>
        </div>
      </div>
      <div className="row">
        <div className="col-6">
          <Label for="onetab-text">OneTab</Label>
          <Input
            type="textarea"
            name="onetab-text"
            id="onetab-text"
            rows="20"
            onChange={onTextChange}
          />
        </div>
        <div className="col-6">
          <Label for="markdown-text">Markdown</Label>
          <Input
            type="textarea"
            name="markdown-text"
            id="markdown-text"
            rows="20"
            value={markdownText}
            readOnly
          />
        </div>
      </div>
    </div>
  )
}

OneTab2Markdown.propTypes = {
  // name: PropTypes.string.isRequired, // this is passed from the Rails view
}

export default OneTab2Markdown
