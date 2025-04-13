import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import QRCode from 'react-qr-code'
import Layout from '../components/layout'
import { useRouter } from 'next/router'
import { toPng } from 'html-to-image'
import { supabase } from '../lib/supabase'
import { Role } from '../lib/roles'

interface Container {
  id: string
  name: string
  location: string
  form_type: string
}

export default function Dashboard() {
  const [containers, setContainers] = useState<Container[]>([])
  const [formResponses, setFormResponses] = useState<any[]>([])
  const [name, setName] = useState('')
  const [location, setLocation] = useState('')
  const [formType, setFormType] = useState('containerForm')
  const [role, setRole] = useState<Role | null>(null)
  const [selectedContainer, setSelectedContainer] = useState<Container | null>(null)
  const qrRef = useRef(null)
  const router = useRouter()
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const [qrUrl, setQrUrl] = useState('')

  useEffect(() => {
    const email = localStorage.getItem('email')
    const role = localStorage.getItem('role') as Role | null

    if (!email || role !== 'gerente') {
      router.push('/login')
      return
    }

    setUserEmail(email)
    setRole(role)
    fetchContainers()
    fetchForms()
  }, [router])

  const fetchContainers = async () => {
    const { data, error } = await supabase
      .from('containers')
      .select('*')
      .order('created_at', { ascending: false })

    if (!error && data) setContainers(data)
  }

  const fetchForms = async () => {
    const { data, error } = await supabase
      .from('form_responses')
      .select('*')
      .order('created_at', { ascending: false })

    if (!error && data) setFormResponses(data)
  }

  useEffect(() => {
    if (selectedContainer && typeof window !== 'undefined') {
      const url = new URL(`/${selectedContainer.form_type}`, window.location.origin)
      url.searchParams.set('id', selectedContainer.id)
      url.searchParams.set('name', selectedContainer.name)
      url.searchParams.set('location', selectedContainer.location)
      setQrUrl(url.toString())
    }
  }, [selectedContainer])

  const handleAddContainer = async () => {
    if (!name) return alert('Nome é obrigatório!')

    const { error } = await supabase.from('containers').insert({
      name,
      location,
      form_type: formType,
      created_by: userEmail,
    })

    if (error) {
      alert('Erro ao adicionar container: ' + error.message)
      return
    }

    setName('')
    setLocation('')
    setFormType('containerForm')
    fetchContainers()
  }

  const handleDeleteResponse = async (id: string) => {
    const confirm = window.confirm('Deseja realmente excluir este formulário?')
    if (!confirm) return

    const { error } = await supabase.from('form_responses').delete().eq('id', id)
    if (!error) {
      setFormResponses(prev => prev.filter(resp => resp.id !== id))
    } else {
      alert('Erro ao excluir: ' + error.message)
    }
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
      <div className="mb-6 flex justify-between items-center">
        <p className="text-sm text-gray-700 font-medium">Bem-vindo, {userEmail}</p>
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
                value={qrUrl}
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
            className="border p-2 rounded w-full mb-2"
          >
            <option value="containerForm">Checklist Container</option>
            <option value="execucaoManutencao">Plano de Manutenção</option>
            <option value="inspecaoVeiculo">Inspeção de Veículo</option>
            <option value="inspecaoEmbarcacao">Inspeção de Embarcação</option>
          </select>
          <button
            className="bg-blue-600 text-white px-4 py-2 rounded w-full hover:bg-blue-700"
            onClick={handleAddContainer}
          >
            Adicionar container
          </button>
        </div>

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
                      value={`${window.location.origin}/${container.form_type}?id=${container.id}&name=${container.name}&location=${container.location}`}
                      size={64}
                      style={{ height: 'auto', maxWidth: '100%', width: '64px' }}
                    />
                  </div>
                  <button
                    onClick={() =>
                      setContainers(containers.filter((c) => c.id !== container.id))
                    }
                    className="text-red-600 text-sm underline"
                  >
                    Excluir
                  </button>
                </div>
              </div>
            </div>
          ))}
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
                    <div className="flex gap-4 items-center">
                      <Link
                        href={`/dashboard/respostas/${resp.id}`}
                        className="text-blue-600 text-sm hover:underline"
                      >
                        Ver detalhes
                      </Link>
                      <button
                        onClick={() => handleDeleteResponse(resp.id)}
                        className="text-red-600 text-sm hover:underline"
                      >
                        Excluir
                      </button>
                    </div>
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
