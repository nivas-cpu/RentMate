import { useEffect, useState } from 'react';
import { useAuth } from '../auth/AuthContext';
import { supabase } from '../supabase';
import { Inbox as InboxIcon, MessageSquare } from 'lucide-react';

const Inbox = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeMessageId, setActiveMessageId] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState(null);
  const [sentForId, setSentForId] = useState(null);

  useEffect(() => {
    if (!user) return;

    const fetchMessages = async () => {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('receiver_id', user.id)
        .order('created_at', { ascending: false });

      if (!error && data) {
        setMessages(data);
      }
      setLoading(false);
    };

    fetchMessages();
  }, [user]);

  const handleReply = async (msg) => {
    if (!replyText.trim() || sending) return;

    setSending(true);
    setSendError(null);

    const { error } = await supabase.from('messages').insert([
      {
        sender_id: user.id,
        sender_name: user?.user_metadata?.full_name || user?.email,
        receiver_id: msg.sender_id,
        subject: `Re: ${msg.subject}`,
        content: replyText,
      },
    ]);

    setSending(false);

    if (error) {
      setSendError(error.message);
    } else {
      setSentForId(msg.id);
      setReplyText('');
    }
  };

  if (!user) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="text-center bg-white p-10 rounded-3xl shadow-sm border border-surface-100 max-w-sm w-full">
          <InboxIcon className="w-16 h-16 text-surface-300 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-surface-900 mb-2">Sign in to view messages</h2>
          <p className="text-surface-500 mb-6">You must be logged in to access your inbox.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface-50">
      <div className="bg-gradient-to-br from-surface-900 via-primary-900 to-primary-800 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white flex items-center gap-3">
            <InboxIcon className="w-8 h-8" /> Your Inbox
          </h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {loading ? (
          <div className="text-center py-20 text-surface-500">Loading messages...</div>
        ) : messages.length > 0 ? (
          <div className="space-y-4">
            {messages.map((msg) => {
              const isActive = activeMessageId === msg.id;
              const isSentHere = sentForId === msg.id;

              return (
                <div
                  key={msg.id}
                  className={`bg-white p-6 rounded-2xl border ${
                    !msg.read
                      ? 'border-primary-300 shadow-md ring-1 ring-primary-100'
                      : 'border-surface-200 shadow-sm'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-10 h-10 bg-primary-100 text-primary-700 rounded-full flex items-center justify-center font-bold">
                        {msg.sender_name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h3 className="font-bold text-surface-900">{msg.sender_name}</h3>
                        <p className="text-xs text-surface-400">
                          {new Date(msg.created_at).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                      </div>
                    </div>
                    {!msg.read && (
                      <span className="bg-primary-500 text-white text-[10px] uppercase font-bold px-2 py-0.5 rounded-full">
                        New
                      </span>
                    )}
                  </div>
                  <h4 className="font-semibold text-surface-800 mt-4 mb-1">{msg.subject}</h4>
                  <p className="text-surface-600 text-sm whitespace-pre-wrap">{msg.content}</p>

                  <div className="mt-4">
                    <button
                      className="text-sm font-semibold text-primary-600 hover:text-primary-700"
                      onClick={() => {
                        setActiveMessageId(isActive ? null : msg.id);
                        setReplyText('');
                        setSendError(null);
                        setSentForId(null);
                      }}
                    >
                      {isActive ? 'Close reply' : 'Reply'}
                    </button>
                  </div>

                  {isActive && (
                    <div className="mt-4 border-t border-surface-100 pt-4">
                      <textarea
                        className="w-full rounded-xl border border-surface-200 p-3 text-sm shadow-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/30"
                        rows={3}
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        placeholder="Type your reply to continue the negotiation…"
                      />

                      {sendError && (
                        <p className="text-red-500 text-xs mt-2">
                          {sendError}
                        </p>
                      )}
                      {isSentHere && !sendError && (
                        <p className="text-emerald-600 text-xs mt-2">
                          Reply sent. The other person will see it in their inbox.
                        </p>
                      )}

                      <div className="mt-3 flex justify-end gap-3">
                        <button
                          className="rounded-xl border border-surface-200 px-4 py-2 text-xs font-semibold text-surface-700 hover:bg-surface-50"
                          onClick={() => {
                            setActiveMessageId(null);
                            setReplyText('');
                            setSendError(null);
                          }}
                          disabled={sending}
                        >
                          Cancel
                        </button>
                        <button
                          className="rounded-xl bg-primary-500 px-4 py-2 text-xs font-semibold text-white shadow-sm shadow-primary-500/40 hover:bg-primary-600 disabled:opacity-50"
                          onClick={() => handleReply(msg)}
                          disabled={sending || !replyText.trim()}
                        >
                          {sending && isActive ? 'Sending…' : 'Send reply'}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-24 bg-white rounded-3xl border border-surface-100">
            <div className="w-20 h-20 bg-surface-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <MessageSquare className="w-8 h-8 text-surface-300" />
            </div>
            <h3 className="text-xl font-bold text-surface-700 mb-2">No messages yet</h3>
            <p className="text-surface-400">When someone contacts you about a listing, it will appear here.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Inbox;
