FROM node:latest
WORKDIR /app
COPY package.json /app/
COPY package-lock.json /app/
RUN npm install
COPY . /app/
ENTRYPOINT ["npm"]
CMD ["run", "start"]