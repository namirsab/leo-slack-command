FROM node:11

# Add the service code to the image
ADD . /service
WORKDIR /service

# Install npm dependencies
RUN npm install

# Build the app
RUN npm run build

ENV PORT=80
EXPOSE 80
CMD npm run prod

# Initialize healthcheck
HEALTHCHECK --start-period=30s --interval=5s --timeout=2s --retries=3 \
    CMD nc -z -w1 localhost 80
