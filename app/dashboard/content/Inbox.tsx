"use client";

import { useCallback, useEffect, useState, useTransition } from "react";
import { Check, Inbox as InboxIcon, LoaderCircle, Mail, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { deleteContactMessage, getContactInbox, markContactMessageRead } from "@/app/actions/inbox";

type InboxMessage = {
  id: string;
  name: string;
  email: string;
  message: string;
  readAt: string | null;
  createdAt: string;
};

const dateTime = (value: string) => new Intl.DateTimeFormat(undefined, {
  dateStyle: "medium",
  timeStyle: "short",
}).format(new Date(value));

export default function Inbox() {
  const [messages, setMessages] = useState<InboxMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [isPending, startTransition] = useTransition();

  const applyResult = useCallback((result: Awaited<ReturnType<typeof getContactInbox>>) => {
    if ("error" in result) setError(result.error ?? "Inbox messages could not be loaded.");
    else setMessages(result.messages as InboxMessage[]);
  }, []);

  const loadMessages = useCallback(() => {
    getContactInbox()
      .then(applyResult)
      .catch(() => setError("Inbox messages could not be loaded."))
      .finally(() => setLoading(false));
  }, [applyResult]);

  useEffect(() => {
    let active = true;
    getContactInbox()
      .then((result) => { if (active) applyResult(result); })
      .catch(() => { if (active) setError("Inbox messages could not be loaded."); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [applyResult]);

  const retryLoadMessages = () => {
    setLoading(true);
    setError("");
    loadMessages();
  };

  const markRead = (message: InboxMessage) => {
    startTransition(async () => {
      const result = await markContactMessageRead(message.id);
      if ("error" in result) {
        setNotice(result.error ?? "Message could not be marked as read.");
        return;
      }
      setMessages((current) => current.map((item) => item.id === message.id
        ? { ...item, readAt: new Date().toISOString() }
        : item));
      setNotice("Message marked as read.");
    });
  };

  const removeMessage = (message: InboxMessage) => {
    if (!window.confirm(`Delete the message from ${message.name}?`)) return;
    startTransition(async () => {
      const result = await deleteContactMessage(message.id);
      if ("error" in result) {
        setNotice(result.error ?? "Message could not be deleted.");
        return;
      }
      setMessages((current) => current.filter((item) => item.id !== message.id));
      setNotice("Message deleted.");
    });
  };

  const unreadCount = messages.filter((message) => !message.readAt).length;

  return <div className="flex h-full min-h-0 flex-col gap-4 overflow-y-auto pr-1">
    <header className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/10 bg-gradient-to-br from-secondary/95 to-background/75 p-4 sm:p-5">
      <div className="flex items-center gap-3">
        <span className="grid size-11 place-items-center rounded-xl bg-primary/10 text-primary"><InboxIcon className="size-5" /></span>
        <div>
          <h1 className="text-xl font-semibold text-white sm:text-2xl">Contact inbox</h1>
          <p className="mt-1 text-xs text-white/50">Messages sent through the clinic website.</p>
        </div>
      </div>
      <span className="rounded-full border border-primary/20 bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary">{unreadCount} unread</span>
    </header>

    {notice && <p aria-live="polite" className="rounded-xl border border-white/10 bg-secondary/60 px-3 py-2 text-sm text-white/75" role="status">{notice}</p>}

    {loading ? <div className="flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-secondary/45 py-16 text-sm text-white/50"><LoaderCircle className="size-4 animate-spin" />Loading inbox…</div>
      : error ? <section className="rounded-2xl border border-white/10 bg-secondary/45 p-8 text-center"><p className="text-sm text-rose-300">{error}</p><Button className="mt-4" onClick={retryLoadMessages} size="sm" variant="outline">Try again</Button></section>
        : messages.length ? <div className="space-y-3">{messages.map((message) => <article className={`rounded-2xl border p-4 sm:p-5 ${message.readAt ? "border-white/10 bg-secondary/45" : "border-primary/25 bg-primary/[0.06]"}`} key={message.id}>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="font-semibold text-white">{message.name}</h2>
                {message.readAt ? <span className="rounded-full bg-white/8 px-2 py-0.5 text-[10px] text-white/55">Read</span> : <span className="rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-medium text-primary">Unread</span>}
              </div>
              <a className="mt-1 block break-all text-sm text-primary hover:underline" href={`mailto:${message.email}`}>{message.email}</a>
              <p className="mt-1 text-xs text-white/45">Received {dateTime(message.createdAt)}</p>
            </div>
            <div className="flex shrink-0 gap-2">
              {!message.readAt && <Button loading={isPending} onClick={() => markRead(message)} size="sm" type="button" variant="outline"><Check className="size-3.5" /> Mark read</Button>}
              <Button aria-label={`Delete message from ${message.name}`} loading={isPending} onClick={() => removeMessage(message)} size="sm" type="button" variant="outline"><Trash2 className="size-3.5" /><span className="sr-only">Delete</span></Button>
            </div>
          </div>
          <p className="mt-4 whitespace-pre-wrap break-words border-t border-white/8 pt-4 text-sm leading-6 text-white/80">{message.message}</p>
        </article>)}</div>
          : <section className="rounded-2xl border border-white/10 bg-secondary/45 px-6 py-16 text-center"><Mail className="mx-auto size-8 text-white/30" /><h2 className="mt-3 text-sm font-medium text-white">Your inbox is empty</h2><p className="mt-1 text-xs text-white/45">Messages submitted through the contact form will appear here.</p></section>}
  </div>;
}
