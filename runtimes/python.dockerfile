FROM python:3.12-slim
WORKDIR /code
ENTRYPOINT ["python3", "/code/main.py"]
