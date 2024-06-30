# Use the official Node.js image.
FROM node:21

# Create and change to the app directory.
WORKDIR /usr/src/app

# Copy application dependency manifests to the container image.
COPY package*.json ./

# Copy datadog serverless-init and datadog tracer
COPY --from=datadog/serverless-init:1 /datadog-init /app/datadog-init
COPY --from=datadog/dd-lib-js-init /operator-build/node_modules /dd_tracer/node/

# Install dependencies.
RUN npm install

# Copy application code.
COPY . .

# Expose the port the app runs on.
EXPOSE 3000

# datadog unified service tagging
ENV DD_SERVICE="mbti-cloudrun-nodejs"
ENV DD_ENV="mbti-cloudrun-nodejs"
ENV DD_VERSION="1.1.2"
ENV DD_TRACE_ENABLED=true
ENV DD_SITE='datadoghq.com'
ENV DD_TRACE_PROPAGATION_STYLE='datadog'
ENV DD_LOGS_ENABLED=true
ENV DD_LOGS_INJECTION=true
ENV DD_PROFILING_ENABLED=true
ENV DD_RUNTIME_METRICS_ENABLED=true
ENV DD_APPSEC_ENABLED=true
ENV DD_TRACE_DEBUG=true
ENV DD_TRACE_STARTUP_LOGS=true


# Run the application.
ENTRYPOINT ["/app/datadog-init"]
CMD [ "node", "server.js" ]

