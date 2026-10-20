FROM python:3.14-slim
WORKDIR /app
COPY pyproject.toml ./
COPY pipeline_historian_mcp ./pipeline_historian_mcp
COPY pipeline-historian-mcp/data ./pipeline-historian-mcp/data
RUN pip install --no-cache-dir .
ENV PIPELINE_TELEMETRY_FILE=/app/pipeline-historian-mcp/data/telemetry.csv
CMD ["pipeline-mcp"]