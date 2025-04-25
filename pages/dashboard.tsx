import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import QRCode from 'react-qr-code'
import Layout from 'components/layout'
import { useRouter } from 'next/router'
import { toPng } from 'html-to-image'
import { supabase } from '../lib/supabase'
import React from 'react'

interface Container {
  id: string
  name: string
  location: string
  form_type: string
}

const formatFormTypeLabel = (formType: string) => {
  const map: Record<string, string> = {
    execucaoManutencao: 'Execução de Manutenção',
    inspecaoVeicular: 'Inspeção Veicular',
    inspecaoEmbarcacao: 'Inspeção de Embarcação',
    containerForm: 'Checklist Container'
  }
  return map[formType] || formType
}

export default function Dashboard() {
  const [containers, setContainers] = useState<Container[]>([])
  const [formResponses, setFormResponses] = useState<any[]>([])
  const [name, setName] = useState('')
  const [location, setLocation] = useState('')
  const [formType, setFormType] = useState('containerForm')
  const [role, setRole] = useState<string | null>(null)
  const [selectedContainer, setSelectedContainer] = useState<Container | null>(null)
  const qrRef = useRef(null)
  const router = useRouter()
  const [userEmail, setUserEmail] = useState<string | null>(null)

  const baseURL = process.env.NEXT_PUBLIC_BASE_URL || (typeof window !== 'undefined' ? window.location.origin : '')

  useEffect(() => {
    const email = localStorage.getItem('email')
    setUserEmail(email)
  }, [])

  useEffect(() => {
    const r = localStorage.getItem('role')
    if (r) setRole(r)
  }, [])

  useEffect(() => {
    const r = localStorage.getItem('role')
    if (r !== 'gerente') {
      router.push('/login')
    }
    setRole(r as any)
  }, [])

  useEffect(() => {
    const stored = localStorage.getItem('containers')
    if (stored) {
      setContainers(JSON.parse(stored))
    }
  }, [])

  useEffect(() => {
    localStorage.setItem('containers', JSON.stringify(containers))
  }, [containers])

  useEffect(() => {
    const fetchForms = async () => {
      const { data, error } = await supabase
        .from('form_responses')
        .select('*')
        .order('created_at', { ascending: false })

      if (!error && data) setFormResponses(data)
    }

    fetchForms()
  }, [])

  const handleAddContainer = () => {
    if (!name) return alert('Nome é obrigatório!')
    const newContainer: Container = {
      id: Math.random().toString(36).substring(2, 10),
      name,
      location,
      form_type: formType,
    }
    setContainers(prev => [...prev, newContainer])
    setName('')
    setLocation('')
    setFormType('containerForm')
  }

  const handleDeleteContainer = async (id: string) => {
    const confirmed = window.confirm("Deseja realmente excluir este container?")
    if (!confirmed) return

    const { error } = await supabase.from('containers').delete().eq('id', id)
    if (error) {
      alert("Erro ao excluir: " + error.message)
      return
    }

    setContainers(prev => prev.filter(c => c.id !== id))
  }

  const handleDownload = () => {
    if (qrRef.current) {
      toPng(qrRef.current).then((dataUrl) => {
        const link = document.createElement('a')
        link.download = `${selectedContainer?.name || 'qrcode'}.png`
        link.href = dataUrl
        link.click()
      })
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    localStorage.clear()
    router.push('/login')
  }

  return (
    <Layout>
      <div className="mb-6">
        <p className="text-sm text-gray-700 font-medium mb-2">Bem-vindo, {userEmail}</p>
        <button
          onClick={handleLogout}
          className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition"
        >
          Sair
        </button>
      </div>

      {selectedContainer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 shadow-lg w-full max-w-sm text-center relative">
            <h2 className="text-lg font-bold mb-4">{selectedContainer.name}</h2>
            <div ref={qrRef} className="p-4 bg-white inline-block rounded">
            <QRCode
  value={`${baseURL}/${selectedContainer.form_type}?id=${selectedContainer.id}&name=${selectedContainer.name}&location=${selectedContainer.location}`}
  size={256}
  style={{ height: 'auto', maxWidth: '100%', width: '256px' }}
/>
            </div>
            <div className="flex flex-col gap-3 mt-6">
              <button
                onClick={handleDownload}
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
              >
                Baixar QR Code
              </button>
              <button
                onClick={() => setSelectedContainer(null)}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-3xl mx-auto w-full">
        <div className="bg-white rounded-xl shadow-md p-4 border mb-6">
          <h2 className="text-lg font-semibold mb-2">Criar novo container</h2>
          <input
            type="text"
            placeholder="Nome do container"
            value={name}
            onChange={e => setName(e.target.value)}
            className="border p-2 w-full rounded mb-2"
          />
          <input
            type="text"
            placeholder="Localização (opcional)"
            value={location}
            onChange={e => setLocation(e.target.value)}
            className="border p-2 w-full rounded mb-2"
          />
          <select
            value={formType}
            onChange={(e) => setFormType(e.target.value)}
            className="border p-2 w-full rounded mb-4"
          >
            <option value="">Selecione o tipo de formulário</option>
            <option value="execucaoManutencao">Execução de Manutenção</option>
            <option value="inspecaoVeicular">Inspeção Veicular</option>
            <option value="inspecaoEmbarcacao">Inspeção de Embarcação</option>
          </select>
          <button
            className="bg-blue-600 text-white px-4 py-2 rounded w-full hover:bg-blue-700"
            onClick={handleAddContainer}
          >
            Adicionar container
          </button>
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-3">Containers cadastrados</h2>
          <div className="space-y-4">
            {containers.map(container => (
              <div
                key={container.id}
                className="border rounded-xl p-4 shadow-sm bg-white"
              >
                <h3 className="text-md font-bold">{container.name}</h3>
                {container.location && (
                  <p className="text-sm text-gray-600">Local: {container.location}</p>
                )}
                <p className="text-sm text-gray-600">Tipo de formulário: {formatFormTypeLabel(container.form_type)}</p>
                <div className="flex items-center justify-between mt-3">
                  <Link
                    href={{
                      pathname: `/${container.form_type}`,
                      query: {
                        id: container.id,
                        name: container.name,
                        location: container.location,
                      },
                    }}
                    className="text-blue-600 underline text-sm"
                  >
                    Acessar formulário
                  </Link>
                  <div className="flex items-center gap-3">
                    <div
                      className="cursor-pointer"
                      onClick={() => setSelectedContainer(container)}
                    >
                      <QRCode
                        value={`${baseURL}/${container.form_type}?id=${container.id}&name=${container.name}&location=${container.location}`}
                        size={64}
                        style={{ height: 'auto', maxWidth: '100%', width: '64px' }}
                      />
                    </div>
                    {role === 'gerente' && (
                      <button
                        onClick={() => handleDeleteContainer(container.id)}
                        className="text-red-600 text-sm underline"
                      >
                        Excluir
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-10">
          <h2 className="text-lg font-semibold mb-3">Formulários preenchidos</h2>
          <div className="bg-white rounded-xl shadow p-4">
            {formResponses.length === 0 ? (
              <p className="text-gray-500 text-sm">Nenhum formulário registrado ainda.</p>
            ) : (
              <ul className="space-y-2">
                {formResponses.map((resp) => (
                  <li key={resp.id} className="flex justify-between items-center border-b pb-2">
                    <div>
                      <p className="font-medium">{resp.container_name}</p>
                      <p className="text-sm text-gray-600">
                        Por: {resp.email} • {new Date(resp.created_at).toLocaleString()} • {resp.role}
                      </p>
                    </div>
                    <Link
                      href={`/dashboard/respostas/${resp.id}`}
                      className="text-blue-600 text-sm hover:underline"
                    >
                      Ver detalhes
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </Layout>
  )
}
