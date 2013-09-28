require 'json'
require 'sinatra'
require "sqlite3"
require "sequel"
require "stringex"
  
set :bind, '0.0.0.0'  
set :public_folder, 'public'

DB = Sequel.connect('postgres://postgres:postgres@localhost/talkingdata')
stories = DB[:stories]

################################################################################################################
## Utility functions ###########################################################################################
################################################################################################################


def id_from_name(name)
  # Normalize text:
  #  downcase, strip,
  #  normalize (é = e, ü = u), 
  #  remove ', ", `,
  #  replace sequences of non-word characters by '.',
  #  Remove leading and trailing '.'

  return name.to_s.downcase.strip
    .to_ascii
    .gsub(/['"`]/,'')
    .gsub(/\W+/,'')
    .gsub(/((\.$)|(^\.))/, '')
    
end  

def success
  {
    status: "success"
  }.to_json
end

def failed
  {
    status: "failed"
  }.to_json
end

################################################################################################################
## HTML pages ##################################################################################################
################################################################################################################

get '/' do
  redirect '/index.html' 
end

get '/client' do
  redirect '/client.html'
end

get '/server' do
  redirect '/server.html' 
end 

################################################################################################################
## API #########################################################################################################
################################################################################################################
 
get '/stories/:id.svg' do |id|
  content_type 'image/svg+xml'
  return stories.select(:svg).where(:id => id).get(:svg)
end

get '/stories/:id' do |id|
  content_type 'application/json'
  data = stories.where(:id => id).all
 
  {
    status: "success",
    stories:     
      data.each do |story| 
        story[:geojson] = JSON.parse(story[:geojson]) if story[:geojson]
      end
  }.to_json
end

delete '/stories/:id' do |id|
  # TODO check if delete lukt
  stories.where(:id => id).update(:deleted => true)
end

# Default pagination LIMIT
PER_PAGE = 25
get '/stories' do
  content_type 'application/json'
  
  dataset = stories.select(:id, :name, :type, :svg, :geojson, :done, :date_created)
      .order(Sequel.desc(:date_created))
      
  unless params.has_key? "deleted"
    dataset = dataset.where(:deleted => false)
  end
      
  page = Integer(params["page"]) rescue nil
  per_page = Integer(params["per_page"]) rescue nil
  
  if per_page and page
    dataset = dataset.limit(per_page, (page - 1) * per_page)
  elsif per_page  
    dataset = dataset.limit(per_page)
  elsif page
    dataset = dataset.limit(PER_PAGE, (page - 1) * PER_PAGE)
  end
  
  data = dataset.all
      
  {
    status: "success",
    stories:
      data.each do |story| 
        story[:geojson] = JSON.parse(story[:geojson]) if story[:geojson]
      end
  }.to_json
end

post '/stories/:id/done' do |id|
  data = JSON.parse(request.body.read)
  puts data
  if data.has_key? "done"
    # TODO check if update lukt
    stories.where(:id => id).update(:done => data["done"])
    success
  else
    failed
  end
end

post '/stories' do
  data = JSON.parse(request.body.read)
  puts data.inspect
  name = data["name"] rescue nil
  type = data["type"] rescue nil
  features = data["geojson"]["features"] rescue nil
  
  if name and type and features and features.kind_of?(Array)and features.length
    # check of goed opgeslagen is
  
    # multipoint = { 
    #   type: "MultiPoint",
    #   coordinates: features.map { |f| f["geometry"]["coordinates"] }
    # }
  
    stories.insert(
      id: id_from_name(name),
      name: name,
      type: type,
      svg: data["svg"],
      geojson: data["geojson"].to_json    
    )
  
    success
  else
    failed
  end
end
