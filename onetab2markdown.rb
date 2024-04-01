require 'uri'
require 'public_suffix'

pages = []
ARGF.each_with_index do |line, idx|
  url, title = line.split(' | ', 2)
  next if url&.strip&.empty? || title&.strip&.empty?
  url = URI.parse(url.strip)
  pages.push({
    url: url,
    title: title && title.strip,
  })
end

# puts pages.sort_by {|page| page[:url].host.reverse }
grouped_pages = pages.group_by do |page|
  begin
    PublicSuffix.parse(page[:url].host).domain
  rescue
    STDERR.puts page
  end
end

# pp grouped_pages
grouped_pages = grouped_pages.map { |key, value|
  new_value = value.sort_by { |page| page[:url].host }
  [key, new_value]
}.to_h.sort

markdown_text = ""

grouped_pages.each do |key, value|
  markdown_text += "# #{key}_#{value.length}件\n"
  value.each do | page |
    markdown_text += "- [#{page[:title] || "--タイトルが空です--"}](#{page[:url].to_s})\n"
  end
  markdown_text += "\n"
end

puts markdown_text