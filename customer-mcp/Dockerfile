FROM python:3.14-slim
WORKDIR /app
COPY pyproject.toml ./
COPY customer_mcp ./customer_mcp
COPY it_request_workflow ./it_request_workflow
RUN pip install --no-cache-dir .
ENV MCP_TRANSPORT=http
ENV PORT=3000
EXPOSE 3000
CMD ["customer-mcp"]