require 'json'
require 'sinatra'

  
set :public_folder, 'public'
  
get '/' do
  redirect '/index.html' 
end

get '/client' do
  redirect '/client.html' 

end

get '/server' do
  redirect '/server.html' 
end  

  

