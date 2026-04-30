import { HomeClient } from '@/components/home-client'
import { getAllGuides } from '@/lib/guides'

export default function Home() {
  const guides = getAllGuides().slice(0, 3)
  return <HomeClient guides={guides} />
}
