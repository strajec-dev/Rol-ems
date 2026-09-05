'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import {
  Paddle,
  PaddleRental,
  OpenPlaySession,
  Tournament,
  TournamentPair,
  TournamentFormat,
  BracketMatch,
  Reservation,
  getPairDisplayName,
  initialPaddles,
  initialPaddleRentals,
  openPlaySessions as initialOpenPlaySessions,
  tournaments as initialTournaments,
  bracketMatches as initialBracketMatches,
  reservations as initialReservations,
} from '@/lib/data'

interface PickleballContextType {
  // Paddle Inventory & Rentals
  paddles: Paddle[]
  paddleRentals: PaddleRental[]
  addPaddle: (paddle: Omit<Paddle, 'id'>) => Paddle
  updatePaddle: (id: string, updates: Partial<Paddle>) => void
  deletePaddle: (id: string) => void
  rentPaddle: (rental: Omit<PaddleRental, 'id' | 'rentedAt'>) => PaddleRental
  returnPaddleRental: (rentalId: string) => void
  updatePaddleRentalStatus: (rentalId: string, status: PaddleRental['status']) => void

  // Open Play Sessions
  openPlaySessions: OpenPlaySession[]
  createOpenPlaySession: (session: {
    court: string
    date: string
    dayOfWeek?: string
    startTime: string
    endTime: string
  }) => OpenPlaySession
  updateOpenPlaySession: (id: string, updates: Partial<OpenPlaySession>) => void
  cancelOpenPlaySession: (id: string) => void
  toggleRegistration: (sessionId: string) => void
  toggleQueue: (sessionId: string) => void
  joinOpenPlaySession: (sessionId: string, playerName: string) => { joined: boolean; inQueue: boolean; queuePosition?: number; message: string }
  leaveOpenPlaySession: (sessionId: string, playerName: string) => void
  removeFromQueue: (sessionId: string, playerName: string) => void

  // Tournaments & Brackets
  tournaments: Tournament[]
  bracketMatches: BracketMatch[]
  createTournament: (tournament: Omit<Tournament, 'id' | 'registeredTeams'>) => Tournament
  addPairToTournament: (tournamentId: string, player1: string, player2: string, pairName?: string, extraPlayers?: string[]) => TournamentPair
  updatePair: (tournamentId: string, pairId: string, player1: string, player2: string, pairName?: string, seed?: number, extraPlayers?: string[]) => void
  removePairFromTournament: (tournamentId: string, pairId: string) => void
  updateMatchTeams: (matchId: string, team1: string, team2: string, team1Players?: string[], team2Players?: string[]) => void
  updateMatchScore: (matchId: string, score1: number, score2: number, winnerName: string) => void
  updateMatchSchedule: (matchId: string, court: string, date: string, time: string) => void
  generateBracketFromPairs: (tournamentId: string) => void
  declareChampion: (tournamentId: string, pairName: string, players: string[]) => void

  // Court Reservations
  reservations: Reservation[]
  addReservation: (reservation: Omit<Reservation, 'id' | 'bookingId'>) => Reservation

  // Reset / Sync
  resetToDefault: () => void
}

const PickleballContext = createContext<PickleballContextType | undefined>(undefined)

const LOCAL_STORAGE_KEY = 'rol_ems_pickleball_state_v2'

export const PickleballProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [paddles, setPaddles] = useState<Paddle[]>(initialPaddles)
  const [paddleRentals, setPaddleRentals] = useState<PaddleRental[]>(initialPaddleRentals)
  const [openPlaySessions, setOpenPlaySessions] = useState<OpenPlaySession[]>(initialOpenPlaySessions)
  const [tournaments, setTournaments] = useState<Tournament[]>(initialTournaments)
  const [bracketMatches, setBracketMatches] = useState<BracketMatch[]>(initialBracketMatches)
  const [reservations, setReservations] = useState<Reservation[]>(initialReservations)
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    try {
      const savedState = localStorage.getItem(LOCAL_STORAGE_KEY)
      if (savedState) {
        const parsed = JSON.parse(savedState)
        if (parsed.paddles) setPaddles(parsed.paddles)
        if (parsed.paddleRentals) setPaddleRentals(parsed.paddleRentals)
        if (parsed.openPlaySessions) setOpenPlaySessions(parsed.openPlaySessions)
        if (parsed.tournaments) setTournaments(parsed.tournaments)
        if (parsed.bracketMatches) setBracketMatches(parsed.bracketMatches)
        if (parsed.reservations) setReservations(parsed.reservations)
      }
    } catch (e) {
      console.error('Failed to load state from localStorage', e)
    } finally {
      setIsLoaded(true)
    }
  }, [])

  useEffect(() => {
    if (!isLoaded) return
    try {
      localStorage.setItem(
        LOCAL_STORAGE_KEY,
        JSON.stringify({
          paddles,
          paddleRentals,
          openPlaySessions,
          tournaments,
          bracketMatches,
          reservations,
        })
      )
    } catch (e) {
      console.error('Failed to save state to localStorage', e)
    }
  }, [paddles, paddleRentals, openPlaySessions, tournaments, bracketMatches, reservations, isLoaded])

  const resetToDefault = () => {
    setPaddles(initialPaddles)
    setPaddleRentals(initialPaddleRentals)
    setOpenPlaySessions(initialOpenPlaySessions)
    setTournaments(initialTournaments)
    setBracketMatches(initialBracketMatches)
    setReservations(initialReservations)
    localStorage.removeItem(LOCAL_STORAGE_KEY)
  }

  // ─── PADDLE ACTIONS ─────────────────────────────────────────────────────────

  const addPaddle = (paddleData: Omit<Paddle, 'id'>) => {
    const newPaddle: Paddle = {
      ...paddleData,
      id: `pad-${Date.now().toString().slice(-4)}`,
    }
    setPaddles((prev) => [newPaddle, ...prev])
    return newPaddle
  }

  const updatePaddle = (id: string, updates: Partial<Paddle>) => {
    setPaddles((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...updates } : p))
    )
  }

  const deletePaddle = (id: string) => {
    setPaddles((prev) => prev.filter((p) => p.id !== id))
  }

  const rentPaddle = (rentalData: Omit<PaddleRental, 'id' | 'rentedAt'>) => {
    const newRental: PaddleRental = {
      ...rentalData,
      id: `pdr-${Date.now().toString().slice(-4)}`,
      rentedAt: new Date().toLocaleString(),
    }

    setPaddleRentals((prev) => [newRental, ...prev])

    setPaddles((prev) =>
      prev.map((p) => {
        if (p.id === rentalData.paddleId) {
          const nextQty = Math.max(0, p.quantityAvailable - 1)
          return {
            ...p,
            quantityAvailable: nextQty,
            availability: nextQty === 0 ? 'Rented' : p.availability,
          }
        }
        return p
      })
    )

    return newRental
  }

  const returnPaddleRental = (rentalId: string) => {
    const rental = paddleRentals.find((r) => r.id === rentalId)
    if (!rental) return

    setPaddleRentals((prev) =>
      prev.map((r) => (r.id === rentalId ? { ...r, status: 'Returned' } : r))
    )

    if (rental.paddleId) {
      setPaddles((prev) =>
        prev.map((p) => {
          if (p.id === rental.paddleId) {
            const nextQty = Math.min(p.totalQuantity, p.quantityAvailable + 1)
            return {
              ...p,
              quantityAvailable: nextQty,
              availability: nextQty > 0 && p.availability === 'Rented' ? 'Available' : p.availability,
            }
          }
          return p
        })
      )
    }
  }

  const updatePaddleRentalStatus = (rentalId: string, status: PaddleRental['status']) => {
    setPaddleRentals((prev) =>
      prev.map((r) => (r.id === rentalId ? { ...r, status } : r))
    )
  }

  // ─── OPEN PLAY ACTIONS ──────────────────────────────────────────────────────

  const createOpenPlaySession = (sessionData: {
    court: string
    date: string
    dayOfWeek?: string
    startTime: string
    endTime: string
  }) => {
    const newSession: OpenPlaySession = {
      id: `op-${Date.now().toString().slice(-4)}`,
      court: sessionData.court,
      date: sessionData.date,
      dayOfWeek: sessionData.dayOfWeek || 'Scheduled Day',
      startTime: sessionData.startTime,
      endTime: sessionData.endTime,
      players: [],
      maxPlayers: 12,
      queue: [],
      isRegistrationOpen: true,
      isQueueOpen: true,
      status: 'open',
    }
    setOpenPlaySessions((prev) => [newSession, ...prev])
    return newSession
  }

  const updateOpenPlaySession = (id: string, updates: Partial<OpenPlaySession>) => {
    setOpenPlaySessions((prev) =>
      prev.map((s) => (s.id === id ? { ...s, ...updates } : s))
    )
  }

  const cancelOpenPlaySession = (id: string) => {
    setOpenPlaySessions((prev) =>
      prev.map((s) => (s.id === id ? { ...s, status: 'cancelled', isRegistrationOpen: false } : s))
    )
  }

  const toggleRegistration = (sessionId: string) => {
    setOpenPlaySessions((prev) =>
      prev.map((s) =>
        s.id === sessionId ? { ...s, isRegistrationOpen: !s.isRegistrationOpen } : s
      )
    )
  }

  const toggleQueue = (sessionId: string) => {
    setOpenPlaySessions((prev) =>
      prev.map((s) => (s.id === sessionId ? { ...s, isQueueOpen: !s.isQueueOpen } : s))
    )
  }

  const joinOpenPlaySession = (sessionId: string, playerName: string) => {
    let result = { joined: false, inQueue: false, queuePosition: undefined as number | undefined, message: '' }

    setOpenPlaySessions((prev) =>
      prev.map((session) => {
        if (session.id !== sessionId) return session
        if (!session.isRegistrationOpen) {
          result.message = 'Registration is closed for this session.'
          return session
        }

        if (session.players.includes(playerName)) {
          result.message = 'You are already registered for this session.'
          return session
        }
        if (session.queue.includes(playerName)) {
          const pos = session.queue.indexOf(playerName) + 1
          result.inQueue = true
          result.queuePosition = pos
          result.message = `You are already in queue (Position #${pos}).`
          return session
        }

        if (session.players.length < 12) {
          const updatedPlayers = [...session.players, playerName]
          const isFull = updatedPlayers.length >= 12
          result.joined = true
          result.message = `Successfully joined ${session.court} Open Play session!`
          return {
            ...session,
            players: updatedPlayers,
            status: isFull ? 'full' : 'open',
          }
        } else {
          if (!session.isQueueOpen) {
            result.message = 'Session is FULL (12/12) and player queue is currently closed.'
            return session
          }
          const updatedQueue = [...session.queue, playerName]
          const queuePos = updatedQueue.length
          result.inQueue = true
          result.queuePosition = queuePos
          result.message = `Session FULL (12/12). You automatically entered the queue at Position #${queuePos}.`
          return {
            ...session,
            status: 'full',
            queue: updatedQueue,
          }
        }
      })
    )

    return result
  }

  const leaveOpenPlaySession = (sessionId: string, playerName: string) => {
    setOpenPlaySessions((prev) =>
      prev.map((session) => {
        if (session.id !== sessionId) return session

        const isPlayer = session.players.includes(playerName)
        let nextPlayers = session.players.filter((p) => p !== playerName)
        let nextQueue = session.queue.filter((p) => p !== playerName)

        if (isPlayer && nextQueue.length > 0) {
          const promotedPlayer = nextQueue.shift()!
          nextPlayers.push(promotedPlayer)
        }

        return {
          ...session,
          players: nextPlayers,
          queue: nextQueue,
          status: nextPlayers.length >= 12 ? 'full' : 'open',
        }
      })
    )
  }

  const removeFromQueue = (sessionId: string, playerName: string) => {
    setOpenPlaySessions((prev) =>
      prev.map((s) =>
        s.id === sessionId ? { ...s, queue: s.queue.filter((q) => q !== playerName) } : s
      )
    )
  }

  // ─── TOURNAMENT & BRACKET ACTIONS ──────────────────────────────────────────

  const createTournament = (tData: Omit<Tournament, 'id' | 'registeredTeams'>) => {
    const newTourn: Tournament = {
      ...tData,
      id: `tourn-${Date.now().toString().slice(-4)}`,
      format: tData.format || 'pairing',
      registeredTeams: 0,
      pairs: [],
    }
    setTournaments((prev) => [newTourn, ...prev])
    return newTourn
  }

  const addPairToTournament = (
    tournamentId: string,
    player1: string,
    player2: string,
    pairName?: string,
    extraPlayers?: string[]
  ) => {
    const newPair: TournamentPair = {
      id: `pair-${Date.now().toString().slice(-4)}`,
      tournamentId,
      pairName: pairName && pairName.trim() ? pairName.trim() : undefined,
      player1,
      player2,
      extraPlayers,
      status: 'active',
    }

    setTournaments((prev) =>
      prev.map((t) => {
        if (t.id === tournamentId) {
          const existingPairs = t.pairs || []
          const updatedPairs = [...existingPairs, newPair]
          return {
            ...t,
            pairs: updatedPairs,
            registeredTeams: updatedPairs.length,
          }
        }
        return t
      })
    )

    return newPair
  }

  const updatePair = (
    tournamentId: string,
    pairId: string,
    newPlayer1: string,
    newPlayer2: string,
    newPairName?: string,
    seed?: number,
    extraPlayers?: string[]
  ) => {
    let oldDisplayName = ''
    let newDisplayName = ''
    let newPlayersList: string[] = []

    setTournaments((prev) =>
      prev.map((t) => {
        if (t.id === tournamentId) {
          const updatedPairs = (t.pairs || []).map((p) => {
            if (p.id === pairId) {
              oldDisplayName = getPairDisplayName(p)
              const cleanPairName = newPairName && newPairName.trim() ? newPairName.trim() : undefined
              newDisplayName = getPairDisplayName({ pairName: cleanPairName, player1: newPlayer1, player2: newPlayer2 })
              newPlayersList = [newPlayer1, newPlayer2, ...(extraPlayers || [])].filter(Boolean)

              return {
                ...p,
                pairName: cleanPairName,
                player1: newPlayer1,
                player2: newPlayer2,
                extraPlayers,
                seed: seed !== undefined ? seed : p.seed,
              }
            }
            return p
          })
          return { ...t, pairs: updatedPairs }
        }
        return t
      })
    )

    if (oldDisplayName || newDisplayName) {
      setBracketMatches((prevMatches) =>
        prevMatches.map((m) => {
          let team1 = m.team1
          let team2 = m.team2
          let team1Players = m.team1Players
          let team2Players = m.team2Players

          if (m.team1 === oldDisplayName || m.team1 === newDisplayName) {
            team1 = newDisplayName
            team1Players = newPlayersList
          }
          if (m.team2 === oldDisplayName || m.team2 === newDisplayName) {
            team2 = newDisplayName
            team2Players = newPlayersList
          }

          return {
            ...m,
            team1,
            team2,
            team1Players,
            team2Players,
            winner: m.winner === oldDisplayName ? newDisplayName : m.winner,
          }
        })
      )
    }
  }

  const removePairFromTournament = (tournamentId: string, pairId: string) => {
    setTournaments((prev) =>
      prev.map((t) => {
        if (t.id === tournamentId) {
          const updatedPairs = (t.pairs || []).filter((p) => p.id !== pairId)
          return {
            ...t,
            pairs: updatedPairs,
            registeredTeams: updatedPairs.length,
          }
        }
        return t
      })
    )
  }

  const updateMatchTeams = (
    matchId: string,
    team1: string,
    team2: string,
    team1Players?: string[],
    team2Players?: string[]
  ) => {
    setBracketMatches((prev) =>
      prev.map((m) =>
        m.id === matchId
          ? {
              ...m,
              team1,
              team2,
              team1Players: team1Players || m.team1Players,
              team2Players: team2Players || m.team2Players,
            }
          : m
      )
    )
  }

  const updateMatchScore = (
    matchId: string,
    score1: number,
    score2: number,
    winnerName: string
  ) => {
    setBracketMatches((prevMatches) => {
      const matchIndex = prevMatches.findIndex((m) => m.id === matchId)
      if (matchIndex === -1) return prevMatches

      const targetMatch = prevMatches[matchIndex]
      const updatedMatch: BracketMatch = {
        ...targetMatch,
        score1,
        score2,
        winner: winnerName,
        status: 'completed',
      }

      let updatedMatches = [...prevMatches]
      updatedMatches[matchIndex] = updatedMatch

      const winningPlayers =
        winnerName === targetMatch.team1
          ? targetMatch.team1Players
          : targetMatch.team2Players

      if (targetMatch.nextMatchId) {
        const nextIndex = updatedMatches.findIndex((m) => m.id === targetMatch.nextMatchId)
        if (nextIndex !== -1) {
          const nextMatch = updatedMatches[nextIndex]
          const isTeam1Empty = !nextMatch.team1 || nextMatch.team1.includes('TBD') || targetMatch.matchNumber % 2 === 1

          updatedMatches[nextIndex] = {
            ...nextMatch,
            team1: isTeam1Empty ? winnerName : nextMatch.team1,
            team1Players: isTeam1Empty ? winningPlayers : nextMatch.team1Players,
            team2: !isTeam1Empty ? winnerName : nextMatch.team2,
            team2Players: !isTeam1Empty ? winningPlayers : nextMatch.team2Players,
            status: nextMatch.status === 'pending' ? 'scheduled' : nextMatch.status,
          }
        }
      }

      if (targetMatch.round === 'Final' && targetMatch.tournamentId) {
        setTournaments((prevT) =>
          prevT.map((t) =>
            t.id === targetMatch.tournamentId
              ? {
                  ...t,
                  status: 'completed',
                  championPairName: winnerName,
                  championPlayers: winningPlayers,
                }
              : t
          )
        )
      }

      return updatedMatches
    })
  }

  const updateMatchSchedule = (
    matchId: string,
    court: string,
    date: string,
    time: string
  ) => {
    setBracketMatches((prev) =>
      prev.map((m) => (m.id === matchId ? { ...m, court, date, time } : m))
    )
  }

  const generateBracketFromPairs = (tournamentId: string) => {
    const tournament = tournaments.find((t) => t.id === tournamentId)
    if (!tournament || !tournament.pairs || tournament.pairs.length === 0) return

    const activePairs = tournament.pairs.filter((p) => p.status !== 'eliminated')
    const matches: BracketMatch[] = []

    let matchCounter = 1
    for (let i = 0; i < activePairs.length; i += 2) {
      const p1 = activePairs[i]
      const p2 = activePairs[i + 1]

      const mId = `m-${tournamentId}-${matchCounter}`
      const nextSFId = `m-${tournamentId}-sf-${Math.ceil(matchCounter / 2)}`

      const p1Name = p1 ? getPairDisplayName(p1) : 'BYE'
      const p2Name = p2 ? getPairDisplayName(p2) : 'BYE'

      matches.push({
        id: mId,
        tournamentId,
        round: 'QF',
        matchNumber: matchCounter,
        team1: p1Name,
        team2: p2Name,
        team1Players: p1 ? [p1.player1, p1.player2, ...(p1.extraPlayers || [])].filter(Boolean) : [],
        team2Players: p2 ? [p2.player1, p2.player2, ...(p2.extraPlayers || [])].filter(Boolean) : [],
        court: `Court ${(matchCounter % 3) + 1}`,
        date: tournament.date,
        time: `${8 + Math.floor(matchCounter / 2)}:00 AM`,
        status: p1 && p2 ? 'scheduled' : 'completed',
        winner: !p2 ? p1Name : undefined,
        nextMatchId: nextSFId,
      })

      matchCounter++
    }

    const sf1Id = `m-${tournamentId}-sf-1`
    const sf2Id = `m-${tournamentId}-sf-2`
    const finalId = `m-${tournamentId}-final`

    matches.push({
      id: sf1Id,
      tournamentId,
      round: 'SF',
      matchNumber: matchCounter++,
      team1: 'Winner QF1',
      team2: 'Winner QF2',
      court: 'Court 1',
      date: tournament.date,
      time: '11:00 AM',
      status: 'pending',
      nextMatchId: finalId,
    })

    matches.push({
      id: sf2Id,
      tournamentId,
      round: 'SF',
      matchNumber: matchCounter++,
      team1: 'Winner QF3',
      team2: 'Winner QF4',
      court: 'Court 2',
      date: tournament.date,
      time: '11:00 AM',
      status: 'pending',
      nextMatchId: finalId,
    })

    matches.push({
      id: finalId,
      tournamentId,
      round: 'Final',
      matchNumber: matchCounter,
      team1: 'Winner SF1',
      team2: 'Winner SF2',
      court: 'Court 1',
      date: tournament.date,
      time: '2:00 PM',
      status: 'pending',
    })

    setBracketMatches((prev) => [
      ...prev.filter((m) => m.tournamentId && m.tournamentId !== tournamentId),
      ...matches,
    ])

    setTournaments((prev) =>
      prev.map((t) => (t.id === tournamentId ? { ...t, status: 'in-progress' } : t))
    )
  }

  const declareChampion = (
    tournamentId: string,
    pairName: string,
    players: string[]
  ) => {
    setTournaments((prev) =>
      prev.map((t) =>
        t.id === tournamentId
          ? {
              ...t,
              status: 'completed',
              championPairName: pairName,
              championPlayers: players,
            }
          : t
      )
    )
  }

  // ─── RESERVATIONS ACTIONS ──────────────────────────────────────────────────

  const addReservation = (resData: Omit<Reservation, 'id' | 'bookingId'>) => {
    const bookingId = `PB-${Math.floor(100000 + Math.random() * 900000)}`
    const newReservation: Reservation = {
      ...resData,
      id: Date.now().toString(),
      bookingId,
    }
    setReservations((prev) => [newReservation, ...prev])
    return newReservation
  }

  return (
    <PickleballContext.Provider
      value={{
        paddles,
        paddleRentals,
        addPaddle,
        updatePaddle,
        deletePaddle,
        rentPaddle,
        returnPaddleRental,
        updatePaddleRentalStatus,
        openPlaySessions,
        createOpenPlaySession,
        updateOpenPlaySession,
        cancelOpenPlaySession,
        toggleRegistration,
        toggleQueue,
        joinOpenPlaySession,
        leaveOpenPlaySession,
        removeFromQueue,
        tournaments,
        bracketMatches,
        createTournament,
        addPairToTournament,
        updatePair,
        removePairFromTournament,
        updateMatchTeams,
        updateMatchScore,
        updateMatchSchedule,
        generateBracketFromPairs,
        declareChampion,
        reservations,
        addReservation,
        resetToDefault,
      }}
    >
      {children}
    </PickleballContext.Provider>
  )
}

export const usePickleball = () => {
  const context = useContext(PickleballContext)
  if (!context) {
    throw new Error('usePickleball must be used within a PickleballProvider')
  }
  return context
}
