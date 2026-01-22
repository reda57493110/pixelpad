import AddressesClient from '@/app/account/addresses/AddressesClient'

export default function AddressesPage() {
  return <AddressesClient />
}
  const { user } = useAuth()
  const { t } = useLanguage()
  const email = user?.email || 'guest'
  const [addresses, setAddresses] = useState<Address[]>([])
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState({ fullName: '', phone: '', city: '', line1: '' })

  useEffect(() => {
    try {
      const all = JSON.parse(localStorage.getItem(STORAGE) || '{}')
      setAddresses(all[email] || [])
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Failed to load addresses from localStorage:', error)
      }
    }
  }, [email])

  const save = (list: Address[]) => {
    try {
      const all = JSON.parse(localStorage.getItem(STORAGE) || '{}')
      all[email] = list
      localStorage.setItem(STORAGE, JSON.stringify(all))
      setAddresses(list)
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Failed to save addresses to localStorage:', error)
      }
    }
  }

  const addAddress = (e: React.FormEvent) => {
    e.preventDefault()
    const newAddr: Address = { id: editingId || Date.now().toString(), ...form }
    // keep only one address – replace existing
    save([newAddr])
    setForm({ fullName: '', phone: '', city: '', line1: '' })
    setEditingId(null)
    setShowForm(false)
  }

  const remove = (id: string) => save(addresses.filter(a => a.id !== id))

  return (
    <Protected>
      <AccountLayout title={t('account.addresses.title')}>
        <div className="space-y-4">

        {showForm ? (
          <form onSubmit={addAddress} className="bg-white dark:bg-gray-800 rounded-2xl shadow p-6 space-y-4 mb-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm mb-1">{t('address.fullName')}</label>
                <input value={form.fullName} onChange={(e)=>setForm({ ...form, fullName: e.target.value })} required className="w-full px-3 py-2 rounded border dark:bg-gray-700 dark:border-gray-600" />
              </div>
              <div>
                <label className="block text-sm mb-1">{t('address.phone')}</label>
                <input value={form.phone} onChange={(e)=>setForm({ ...form, phone: e.target.value })} inputMode="tel" required className="w-full px-3 py-2 rounded border dark:bg-gray-700 dark:border-gray-600" />
              </div>
              <div>
                <label className="block text-sm mb-1">{t('address.city')}</label>
                <input value={form.city} onChange={(e)=>setForm({ ...form, city: e.target.value })} required className="w-full px-3 py-2 rounded border dark:bg-gray-700 dark:border-gray-600" />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm mb-1">{t('address.addressLine')}</label>
                <input value={form.line1} onChange={(e)=>setForm({ ...form, line1: e.target.value })} required className="w-full px-3 py-2 rounded border dark:bg-gray-700 dark:border-gray-600" />
              </div>
            </div>
            <div className="flex gap-2 justify-end">
              <button type="button" onClick={()=>{ setShowForm(false); setEditingId(null); setForm({ fullName: '', phone: '', city: '', line1: '' }) }} className="px-4 py-2 rounded border">{t('address.cancel')}</button>
              <button className="px-4 py-2 rounded bg-blue-600 text-white">{t('address.saveAddress')}</button>
            </div>
          </form>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow p-6 space-y-3 mb-6">
            <p className="text-gray-600 dark:text-gray-300">{addresses.length === 0 ? t('address.noAddresses') : t('address.manageAddress')}</p>
            {addresses.length === 0 && (
              <button onClick={()=>{ setEditingId(null); setShowForm(true) }} className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white">{t('address.addAddress')}</button>
            )}
          </div>
        )}

        {addresses.length > 0 && (
          <div className="space-y-3">
            {addresses.slice(0,1).map(a => (
              <div key={a.id} className="bg-white dark:bg-gray-800 rounded-xl shadow p-4 flex items-center justify-between">
                <div>
                  <div className="font-semibold">{a.fullName} — {a.phone}</div>
                  <div className="text-sm text-gray-500">{a.line1}, {a.city}</div>
                </div>
                <div className="flex gap-2">
                  <button onClick={()=>{ setEditingId(a.id); setForm({ fullName: a.fullName, phone: a.phone, city: a.city, line1: a.line1 }); setShowForm(true) }} className="px-3 py-1 rounded border">{t('address.edit')}</button>
                  <button onClick={()=>remove(a.id)} className="px-3 py-1 rounded bg-red-600 text-white">{t('address.delete')}</button>
                </div>
              </div>
            ))}
          </div>
        )}
        </div>
      </AccountLayout>
    </Protected>
  )
}


