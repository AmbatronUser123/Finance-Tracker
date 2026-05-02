# Push Finance Tracker ke GitHub

Remote sudah diset ke: **https://github.com/AmbatronUser123/Finance-Tracker.git**

## 1. Atur identitas Git (sekali saja)

Di PowerShell atau CMD:

```powershell
git config --global user.email "email-anda@example.com"
git config --global user.name "Nama Anda"
```

Ganti dengan email dan nama akun GitHub Anda.

## 2. Commit lalu push

Masuk ke folder proyek:

```powershell
cd "c:\Users\dawsa\Downloads\Coding\Finance-Tracker-master\Finance-Tracker-master"
git add -A
git commit -m "Initial commit: Finance Tracker"
git branch -M master
git push -u origin master
```

Repo di GitHub memakai branch **master**. Jika diminta login, pakai Personal Access Token (bukan password) di: GitHub → Settings → Developer settings → Personal access tokens.

**Jika push ditolak** karena remote sudah punya commit lain, pilih salah satu:

- **Gabung dengan isi remote:**  
  `git pull origin master --allow-unrelated-histories`  
  lalu selesaikan konflik (jika ada), commit, lalu `git push -u origin master`

- **Timpa remote dengan kode lokal (hati-hati):**  
  `git push -u origin master --force`
