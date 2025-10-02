# Pasta Cloud

Cloud services for Pasta

### Build instructions

```bash
mkdir ~/pasta

docker build -t pasta-cloud .
docker run -v ~/pasta:/pasta -p 8000:8000 pasta-cloud
```
