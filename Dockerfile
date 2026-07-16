FROM nginx:1.27-alpine

# Serve the IGNITE working prototype (static HTML/CSS/JS).
RUN rm -f /etc/nginx/conf.d/default.conf
COPY deploy/nginx.conf /etc/nginx/conf.d/app.conf
COPY design /usr/share/nginx/html/design

EXPOSE 80
