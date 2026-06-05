@echo off
echo =========================================
echo    Starting Placement Portal Services
echo =========================================

echo.
echo Starting Backend (Spring Boot)...
start "Backend Server" cmd /k "cd backend && mvn clean package -DskipTests && java -jar target\backend-0.0.1-SNAPSHOT.jar"

echo.
echo Starting Frontend (Vite/React)...
start "Frontend Server" cmd /k "cd frontend && npm run dev"

echo.
echo Both servers are starting up in separate windows!
echo - Backend will be available at http://localhost:8080 (usually)
echo - Frontend will be available at http://localhost:5173 (usually)
echo.
pause
