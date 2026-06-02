"use client";

import { useState } from "react";
import { Camera, Lock, Mail, PencilLine, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function AccountPage() {
  const [profileName, setProfileName] = useState("Yourin Dev");
  const [email, setEmail] = useState("yourin@ticketin.id");
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  return (
    <div className="space-y-8 animate-fade-in max-w-5xl">
      <div className="flex flex-col gap-2">
        <p className="text-[10px] font-black uppercase tracking-[0.35em] text-primary">Account Settings</p>
        <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-100 italic">My Account</h1>
        <p className="text-sm text-zinc-500">Update your public profile and security details. This page is frontend-only for now.</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[320px_minmax(0,1fr)] gap-8">
        <section className="p-6 rounded-[2rem] bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-6">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <User className="size-5 text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">Profile Preview</h2>
              <p className="text-xs text-zinc-500">What users will see</p>
            </div>
          </div>

          <div className="flex flex-col items-center gap-4 text-center">
            <div className="relative size-36 rounded-[2rem] border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 overflow-hidden flex items-center justify-center">
              {avatarPreview ? (
                <img src={avatarPreview} alt="Avatar preview" className="size-full object-cover" />
              ) : (
                <div className="flex flex-col items-center gap-2 text-zinc-400">
                  <Camera className="size-7" />
                  <span className="text-xs font-semibold uppercase tracking-widest">No photo</span>
                </div>
              )}
            </div>

            <div>
              <p className="text-xl font-black tracking-tight text-zinc-900 dark:text-zinc-100">{profileName}</p>
              <p className="text-sm text-zinc-500">Administrator</p>
            </div>
          </div>
        </section>

        <section className="space-y-6">
          <div className="p-6 rounded-[2rem] bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-6">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                <PencilLine className="size-5 text-blue-500" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">Profile Info</h2>
                <p className="text-xs text-zinc-500">Change your name and avatar</p>
              </div>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="display-name">Display name</Label>
                <Input id="display-name" value={profileName} onChange={(event) => setProfileName(event.target.value)} placeholder="Your display name" />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="avatar">Profile photo</Label>
                <Input
                  id="avatar"
                  type="file"
                  accept="image/*"
                  onChange={(event) => {
                    const file = event.target.files?.[0];
                    if (!file) {
                      setAvatarPreview(null);
                      return;
                    }

                    const reader = new FileReader();
                    reader.onload = () => {
                      setAvatarPreview(String(reader.result));
                    };
                    reader.readAsDataURL(file);
                  }}
                />
              </div>
            </div>
          </div>

          <div className="p-6 rounded-[2rem] bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-6">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                <Mail className="size-5 text-emerald-500" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">Email</h2>
                <p className="text-xs text-zinc-500">Keep contact details up to date</p>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">New email</Label>
              <Input id="email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" />
            </div>
          </div>

          <div className="p-6 rounded-[2rem] bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-6">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
                <Lock className="size-5 text-amber-500" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">Password</h2>
                <p className="text-xs text-zinc-500">Set a new password for this account</p>
              </div>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="current-password">Current password</Label>
                <Input id="current-password" type="password" placeholder="••••••••" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-password">New password</Label>
                <Input id="new-password" type="password" placeholder="••••••••" />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="confirm-password">Confirm new password</Label>
                <Input id="confirm-password" type="password" placeholder="••••••••" />
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-3 justify-end">
            <Button variant="outline" className="rounded-xl">Cancel</Button>
            <Button className="rounded-xl">Save changes</Button>
          </div>
        </section>
      </div>
    </div>
  );
}