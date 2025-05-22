# Use an official Python runtime as a parent image
FROM python:3.12

RUN useradd -r nonroot

WORKDIR /app/backend/

ARG ENDPOINT
ARG CLIENTID
ARG CLIENTSECRET
ARG TENANTID
ARG AUTHORITY
ARG SERVER
ARG DATABASE
ARG SQLDRIVER
ARG SQLSCHEMA

ENV ENDPOINT=$ENDPOINT
ENV CLIENTID=$CLIENTID
ENV CLIENTSECRET=$CLIENTSECRET
ENV TANENTID=$TANENTID
ENV AUTHORITY=$AUTHORITY
ENV SERVER=$SERVER
ENV DATABASE=$DATABASE
ENV SQLDRIVER=$SQLDRIVER
ENV SQLSCHEMA=$SQLSCHEMA

ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

RUN curl https://packages.microsoft.com/keys/microsoft.asc | apt-key add -
RUN curl https://packages.microsoft.com/config/ubuntu/20.04/prod.list > /etc/apt/sources.list.d/mssql-release.list


RUN pip3 install setuptools
RUN apt-get update && apt-get install -y --no-install-recommends \
    unixodbc-dev \
    unixodbc \
    libpq-dev \
    nano

RUN ACCEPT_EULA=Y apt-get install -y msodbcsql17
RUN ACCEPT_EULA=Y apt-get install -y mssql-tools

COPY GHD/webapp/backend /app/backend
RUN chmod 777 /app/*  -R
RUN chmod 777 /app/backend -R
RUN ls -lrth /app/backend/
RUN python -m pip install --upgrade pip
RUN pip3 install -r requirements.txt

#Expose port
EXPOSE 8000
USER nonroot
HEALTHCHECK CMD curl --fail http://localhost:8000 || exit 1

CMD ["uvicorn", "main:app", "--reload","--host", "0.0.0.0", "--port", "80","--workers", "4"]
