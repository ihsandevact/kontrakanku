# Aturan Operasional Proyek & Git Workflow

## 1. Pembatasan Git Commit & Push
- **Dilarang Commit Otomatis**: JANGAN PERNAH menjalankan `git commit` tanpa adanya instruksi eksplisit dari pengguna (misal: "commit", "tolong commit", "commit dan push").
- **Dilarang Push Otomatis**: JANGAN PERNAH menjalankan `git push` ke remote repository tanpa perintah atau izin tertulis dari pengguna.
- **Fokus Verifikasi Lokal**: Seluruh perbaikan bug, penambahan fitur, dan verifikasi kode harus diselesaikan dan diuji di lingkungan lokal terlebih dahulu, membiarkan status git dalam kondisi *modified* di working directory sampai diperintahkan untuk di-commit/push.
