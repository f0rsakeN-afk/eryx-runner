FROM ruby:3.3-alpine
WORKDIR /code
ENTRYPOINT ["ruby", "/code/main.rb"]
