import { Plus } from 'lucide-react'
import Image from 'next/image'

import { Button } from '@/components/ui/button'

import letsStartIllustration from '../assets/lets-start-illustration.svg'
import logoInOrbit from '../assets/logo-in-orbit.svg'

export default function Home() {
  return (
    <div className="flex h-screen flex-col items-center justify-center gap-8">
      <Image src={logoInOrbit} alt="in.orbit" />
      <Image
        src={letsStartIllustration}
        alt="Illustration of a person holding a launch button next to a space shuttle taking off."
      />

      <div className="flex w-full max-w-80 flex-col items-center justify-center gap-5">
        <p className="text-center leading-relaxed text-zinc-300">
          You haven't registered any goals yet, how about{' '}
          <span className="relative inline-block font-medium text-zinc-200 antialiased transition-all duration-500 before:absolute before:-bottom-0.5 before:left-0 before:h-0.5 before:w-0 before:bg-zinc-100 before:opacity-0 before:transition-all before:duration-500 before:content-[''] hover:cursor-pointer hover:text-zinc-100 hover:before:w-full hover:before:opacity-100">
            registering one
          </span>{' '}
          right now?
        </p>
        <Button type="button" className="flex items-center justify-center">
          <Plus className="size-4" />
          Register goal
        </Button>
      </div>
    </div>
  )
}
