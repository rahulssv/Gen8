# Steps to follow
```bash
sudo docker build -t biomarker-postgres ./postgres
docker run -d   --name biomarker-db   -p 5432:5432   -v biomarker-data:/var/lib/postgresql/data   biomarker-postgres
backend/
pip install -r requirements.txt
sudo apt install uvicorn
uvicorn main:app --reload
```