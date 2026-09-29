FROM node:22-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY tsconfig.json ./
COPY customer-mcp/src ./customer-mcp/src
ENV MCP_TRANSPORT=http
ENV PORT=3000
EXPOSE 3000
CMD ["npm", "run", "mcp"]
