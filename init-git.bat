@echo off
echo 初始化 Git 仓库并准备首次提交...

REM 初始化Git仓库
git init

REM 添加所有文件
git add .

REM 首次提交
git commit -m "初始化WatermarkLab项目"

echo.
echo 你现在需要在GitHub上创建一个新的仓库，然后运行以下命令：
echo git remote add origin https://github.com/你的用户名/watermarklab.git
echo git branch -M main
echo git push -u origin main
echo.
echo 完成！

pause 