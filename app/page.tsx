import Banner from "@/components/banner"
import FeaturedServicesSection from "@/components/FeaturedServicesSection"
import SalonExperienceSection from "@/components/SalonExperienceSection"
import ServiceCategoriesSection from "@/components/ServiceCategoriesSection"
import { Button } from "@/components/ui/button"

export default function Page() {
  return (
    <div>
      <Banner/>
      <FeaturedServicesSection/>
      <ServiceCategoriesSection/>
      <SalonExperienceSection/>
    </div>
  )
}
