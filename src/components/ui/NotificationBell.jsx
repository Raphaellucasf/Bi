import React, { useEffect, useState } from "react";
import { supabase } from "../../services/supabaseClient";
import Icon from "../AppIcon";

export default function NotificationBell({ userId }) {
  const [count, setCount] = useState(0);
  const [showList, setShowList] = useState(false);
  const [notificacoes, setNotificacoes] = useState([]);

  useEffect(() => {
    if (!userId) return;
    supabase
      .from("notificacoes")
      .select("*")
      .eq("user_id", userId)
      .eq("lida", false)
      .then(({ data }) => {
        setCount(data ? data.length : 0);
        setNotificacoes(data || []);
      });
  }, [userId, showList]);

  return (
    <div className="relative">
      <button className="relative" onClick={() => setShowList(s => !s)}>
        <Icon name="Bell" size={24} />
        {count > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-600 text-white rounded-full px-2 text-xs font-bold">{count}</span>
        )}
      </button>
      {showList && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded shadow-lg z-50 p-4">
          <h4 className="font-bold mb-2">Notificações</h4>
          {notificacoes.length === 0 ? (
            <div className="text-muted-foreground">Nenhuma notificação não lida.</div>
          ) : (
            <ul className="space-y-2">
              {notificacoes.map(n => (
                <li key={n.id} className="border rounded p-2 bg-gray-50">
                  <div>{n.mensagem}</div>
                  <button className="text-xs text-blue-600 mt-1" onClick={async () => {
                    await supabase.from("notificacoes").update({ lida: true }).eq("id", n.id);
                    setNotificacoes(notificacoes.filter(x => x.id !== n.id));
                    setCount(c => c - 1);
                  }}>Marcar como lida</button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
