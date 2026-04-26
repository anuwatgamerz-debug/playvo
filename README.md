# 🎉 Playvo - Play Every Moment

โซเชียลมีเดียสำหรับเพื่อนๆ ใช้ Next.js + Firebase

## ฟีเจอร์
- ✅ สมัคร/ล็อกอินด้วย Email หรือ Google
- ✅ โพสต์ข้อความ + รูปภาพ
- ✅ คอมเมนต์ + Reactions (6 แบบ)
- ✅ เพิ่มเพื่อน + คำขอเป็นเพื่อน
- ✅ แชท 1-1 แบบ real-time
- ✅ โปรไฟล์ส่วนตัว แก้ไขได้

## Deploy
Deploy บน Vercel ได้ฟรี — ไม่ต้องตั้งค่าอะไรเพิ่ม

## Setup Firestore Security Rules
ใน Firebase Console → Firestore Database → Rules ใช้กฎนี้:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == userId;
      allow update: if request.auth != null;
    }
    match /posts/{postId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
      allow update, delete: if request.auth != null && resource.data.userId == request.auth.uid;
      allow update: if request.auth != null;
      match /comments/{commentId} {
        allow read, create: if request.auth != null;
        allow update, delete: if request.auth != null && resource.data.userId == request.auth.uid;
      }
    }
    match /chats/{chatId}/messages/{messageId} {
      allow read, create: if request.auth != null;
    }
  }
}
```
