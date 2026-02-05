#!/bin/bash

# 1. Видалення старих версій та конфліктних пакетів
echo "--- Видалення старих версій ---"
for pkg in docker.io docker-doc docker-compose docker-compose-v2 podman-docker containerd runc; do sudo apt-get remove $pkg; done

# 2. Оновлення пакетів та встановлення необхідних утиліт
echo "--- Встановлення залежностей ---"
sudo apt-get update
sudo apt-get install -y ca-certificates curl gnupg

# 3. Додавання офіційного GPG ключа Docker
echo "--- Налаштування ключів Docker ---"
sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
sudo chmod a+r /etc/apt/keyrings/docker.gpg

# 4. Додавання репозиторію до джерел Apt
echo "--- Додавання репозиторію ---"
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# 5. Встановлення Docker Engine та Docker Compose
echo "--- Встановлення Docker та Docker Compose ---"
sudo apt-get update
sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# 6. Налаштування прав користувача (щоб не писати sudo docker...)
echo "--- Додавання користувача $USER до групи docker ---"
sudo usermod -aG docker $USER

# 7. Активація сервісу
sudo systemctl enable docker
sudo systemctl start docker

echo "✅ Встановлення завершено!"
echo "⚠️  УВАГА: Вийдіть із системи (logout) та зайдіть знову, щоб зміни прав доступу набули чинності."