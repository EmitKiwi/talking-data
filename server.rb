require 'json'
require 'sinatra'
require "sequel"
  
set :bind, '0.0.0.0'  
set :public_folder, 'public'

DB = Sequel.connect('postgres://postgres:postgres@localhost/talkingdata')
table = DB[:talkingdata]

get '/' do
  redirect '/index.html' 
end

get '/client' do
  redirect '/client.html'
end

get '/server' do
  redirect '/server.html' 
end  

get '/data.json' do
  content_type 'application/json'
  return table.select(:id, :name, :svg, :date_created).order(Sequel.desc(:date_created)).all.to_json
end

#delete '/user/:id' do |id|
#   #do something in the model
#end

get '/svg/:id.svg' do |id|
  content_type 'image/svg+xml'
  return table.select(:svg).where(:id => id).get(:svg)
end

post '/save' do
  data = JSON.parse(request.body.read)  

  multipoint = { 
    type: "MultiPoint",
    coordinates: data["geojson"]["features"].map { |f| f["geometry"]["coordinates"] }
  }
  
  table.insert(
    :name => data["name"], 
    :svg => data["svg"], 
    :geojson =>  data["geojson"].to_json,
    :geom => Sequel.function(:ST_SetSRID, Sequel.function(:ST_GeomFromGeoJSON, multipoint.to_json), 4326)
  )
end
