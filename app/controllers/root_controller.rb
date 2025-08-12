class RootController < ApplicationController
  def index; end

  def convert
    markdown_text = convert_to_markdown(params[:text])

    render json: { markdownText: markdown_text }
  end

  private

  def convert_to_markdown(text)
    pages = []
    text.lines.each_with_index do |line, _idx|
      url, title = line.split(' | ', 2)

      next if url&.strip&.empty? || title&.strip&.empty?

      url = Addressable::URI.parse(url.strip)
      pages.push({
        url: url,
        title: title && title.strip,
      })
    end

    # puts pages.sort_by {|page| page[:url].host.reverse }
    grouped_pages = pages.group_by do |page|
      begin
        PublicSuffix.parse(page[:url].host).domain
      rescue PublicSuffix::DomainNotAllowed => _e
        "DomainNotAllowed: unknown (#{page[:url]})"
      rescue PublicSuffix::DomainInvalid => _e
        "DomainInvalid: unknown (#{page[:url]})"
      end
    end

    # pp grouped_pages
    grouped_pages = grouped_pages.map { |key, value|
      new_value = value.sort_by { |page| page[:url].host }
      [key || 'Unknown', new_value]
    }.to_h.sort

    markdown_text = ''

    grouped_pages.each do |key, value|
      markdown_text += "# #{key}_#{value.length}件\n"
      value.each do | page |
        markdown_text += "- [#{page[:title] || '--タイトルが空です--'}](#{page[:url].to_s})\n"
      end
      markdown_text += "\n"
    end

    markdown_text
  end
end
