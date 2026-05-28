import { ReactNode } from 'react'
import CharAvatar, { charForJob } from './CharAvatar'

export default function NpcBox({
  title = 'NPC',
  npcName,
  npcCls,
  children,
  actions,
}: {
  title?: string
  npcName?: string
  npcCls?: string
  children?: ReactNode
  actions?: ReactNode
}) {
  const cls = npcCls ?? (npcName ? charForJob(npcName) : 'npc')

  return (
    <div className="ms-npc-box">
      <div className="ms-npc-title">💬 {title}</div>
      <div className="ms-npc-body">
        <CharAvatar cls={cls} size={84} showLabel={false} />
        <div className="ms-npc-text">
          {npcName && <span className="ms-npc-name">— {npcName} —</span>}
          {children}
        </div>
      </div>
      {actions && <div className="ms-npc-actions">{actions}</div>}
    </div>
  )
}
