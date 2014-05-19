use Rack::Auth::Basic do |user, pass|
    user == ENV['USER'] && pass == ENV['PASS']
end

use Rack::Static,
    :root => '.',
    :index => 'index.html'

run Rack::Directory.new(File.dirname(__FILE__))
