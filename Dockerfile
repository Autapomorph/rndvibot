#
# 🛠️ Production Build
#
FROM node:20-alpine AS build
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm ci --ignore-scripts
COPY . .
RUN npm run build

#
# 🚀 Launch Production Server
#
FROM node:20-alpine as production
WORKDIR /usr/src/app
ENV NODE_ENV production
COPY --from=build /usr/src/app/build ./build
COPY --from=build /usr/src/app/locales ./locales
COPY --from=build /usr/src/app/package*.json .
COPY --from=build /usr/src/app/node_modules ./node_modules
CMD ["npm", "run", "start:prod"]
