# Hướng dẫn Thiết lập CI/CD & Triển khai VPS (Production Deployment Guide)

Tài liệu này hướng dẫn chi tiết quy trình tự động hóa triển khai (CI/CD) cho **Factory Management System**:
`git push main` $\rightarrow$ `GitHub Actions` $\rightarrow$ `Build & Push Docker Images lên GHCR` $\rightarrow$ `SSH vào VPS` $\rightarrow$ `Tự động cập nhật & Restart Container`.

---

## 1. Kiến trúc luồng triển khai (CI/CD Architecture)

```mermaid
flowchart TD
    A["Developer (git push main)"] --> B["GitHub Actions (.github/workflows/deploy.yml)"]
    subgraph GitHub Runner
        B --> C["Job 1: Test & Validate<br/>(Frontend Validate + Backend Test)"]
        C --> D["Job 2: Build & Push<br/>(Buildx Multi-stage + GHCR)"]
    end
    subgraph Registry
        D --> E["GitHub Container Registry (ghcr.io)<br/>• factory-backend:latest & sha<br/>• factory-frontend:latest & sha"]
    end
    subgraph Production VPS
        D --> F["Job 3: SSH Deploy (appleboy/ssh-action)"]
        F --> G["Copy docker-compose.prod.yml & nginx.conf"]
        G --> H["Docker login GHCR & docker compose pull"]
        H --> I["docker compose up -d --remove-orphans"]
        I --> J["Healthcheck /actuator/health (HTTP 200)"]
        J --> K["docker image prune -f"]
    end
```

---

## 2. Chuẩn bị VPS (Thực hiện 1 lần duy nhất)

### Bước 2.1: Cài đặt Docker & Docker Compose trên VPS
Đăng nhập SSH vào VPS bằng quyền `root` hoặc `sudo`:
```bash
# Cài đặt Docker engine mới nhất
curl -fsSL https://get.docker.com | sh

# Bật Docker service tự khởi động cùng hệ thống
sudo systemctl enable docker
sudo systemctl start docker

# Kiểm tra phiên bản
docker --version
docker compose version
```

### Bước 2.2: Tạo thư mục triển khai
```bash
sudo mkdir -p /opt/factory-management
sudo chown -R $USER:$USER /opt/factory-management
cd /opt/factory-management
```

### Bước 2.3: Tạo file môi trường `.env` ban đầu trên VPS
Tạo file `/opt/factory-management/.env` với các thông số bảo mật của bạn:
```bash
nano /opt/factory-management/.env
```
*(Hoặc cấu hình qua GitHub Secret `APP_ENV_FILE` ở phần 3 để GitHub tự động ghi đè).*

---

## 3. Tạo SSH Key và Cấu hình GitHub Secrets

### Bước 3.1: Tạo cặp SSH Key riêng cho GitHub Actions
Bạn có thể tạo ngay trên máy tính cá nhân hoặc trên VPS:
```bash
ssh-keygen -t ed25519 -C "github-actions-deploy" -f ~/.ssh/github_deploy_key -N ""
```
Lệnh này tạo ra 2 file:
* `github_deploy_key`: Private key (dùng nạp vào GitHub Secrets).
* `github_deploy_key.pub`: Public key (cần thêm vào VPS).

### Bước 3.2: Thêm Public Key vào VPS
Copy nội dung file `github_deploy_key.pub` và gắn vào file `~/.ssh/authorized_keys` trên VPS:
```bash
cat github_deploy_key.pub >> ~/.ssh/authorized_keys
chmod 600 ~/.ssh/authorized_keys
chmod 700 ~/.ssh
```

### Bước 3.3: Thêm Secrets trên GitHub Repository
Truy cập repository GitHub của bạn:
`https://github.com/Huylenapoleong/factory-management` $\rightarrow$ **Settings** $\rightarrow$ **Secrets and variables** $\rightarrow$ **Actions** $\rightarrow$ **New repository secret**:

| Tên Secret | Bắt buộc | Giá trị |
| :--- | :---: | :--- |
| `VPS_HOST` | **Có** | Địa chỉ IP Public của VPS (ví dụ: `103.12.34.56` hoặc domain) |
| `VPS_USERNAME` | **Có** | Tên user SSH trên VPS (ví dụ: `ubuntu`, `debian` hoặc `root`) |
| `VPS_SSH_KEY` | **Có** | Toàn bộ nội dung của file private key `github_deploy_key` (bao gồm cả dòng `-----BEGIN OPENSSH PRIVATE KEY-----` và `-----END OPENSSH PRIVATE KEY-----`) |
| `VPS_SSH_PORT` | Không | Cổng SSH của VPS (mặc định là `22` nếu để trống) |
| `APP_ENV_FILE` | Khuyên dùng | Toàn bộ nội dung file `.env` production (chứa `DB_PASSWORD`, `JWT_SECRET`, v.v.) để tự động đồng bộ khi deploy |

---

## 4. Bật quyền Packages (GHCR) cho GitHub Actions

Để workflow có quyền tự động tạo và push Docker image lên GitHub Container Registry:
1. Vào **Settings** của repository trên GitHub.
2. Chọn **Actions** $\rightarrow$ **General**.
3. Cuộn xuống phần **Workflow permissions**:
   * Chọn **Read and write permissions**.
   * Tích chọn **Allow GitHub Actions to create and approve pull requests**.
4. Nhấn **Save**.

---

## 5. Kích hoạt và Kiểm tra Triển khai

1. **Tự động khi push code:**
   Khi bạn commit và push code lên nhánh `main`:
   ```bash
   git add .
   git commit -m "feat: setup full CI/CD deployment pipeline to VPS"
   git push origin main
   ```
2. **Kích hoạt thủ công (Manual Trigger):**
   * Vào tab **Actions** trên GitHub.
   * Chọn workflow **Build, Publish & Deploy**.
   * Nhấn **Run workflow** $\rightarrow$ chọn nhánh `main` $\rightarrow$ **Run workflow**.

3. **Kiểm tra kết quả:**
   * Sau khi pipeline báo xanh, truy cập vào IP hoặc domain VPS của bạn:
     * Giao diện: `http://<IP_VPS>/`
     * Health check: `http://<IP_VPS>/actuator/health`
     * Swagger Docs: `http://<IP_VPS>/swagger-ui/index.html`

