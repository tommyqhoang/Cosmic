import { render, screen } from '@testing-library/react'
import { SWRConfig } from 'swr'
import StatusBoard from '@/components/status/StatusBoard'

function stubFetch(json: unknown) {
  ;(global.fetch as jest.Mock).mockResolvedValue({ ok: true, status: 200, json: async () => json })
}

beforeEach(() => {
  global.fetch = jest.fn()
})

// Fresh SWR cache per render so one test's data can't leak into the next.
function renderBoard() {
  return render(
    <SWRConfig value={{ provider: () => new Map(), dedupingInterval: 0 }}>
      <StatusBoard />
    </SWRConfig>,
  )
}

describe('StatusBoard', () => {
  it('shows Online, the player count, and the world/channels when the server is up', async () => {
    stubFetch({ online: true, players: 42, ts: Date.now() })
    renderBoard()
    expect(await screen.findByText('Server Online')).toBeInTheDocument()
    expect(screen.getByText('42')).toBeInTheDocument()
    expect(screen.getByText('Scania')).toBeInTheDocument()
    expect(screen.getByText('CH1')).toBeInTheDocument()
  })

  it('shows Offline when the server is down', async () => {
    stubFetch({ online: false, players: 0, ts: Date.now() })
    renderBoard()
    expect(await screen.findByText('Server Offline')).toBeInTheDocument()
  })
})
