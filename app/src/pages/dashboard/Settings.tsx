import { useAuth } from '../../hooks/useAuth'
import { useRestaurant } from './settingsKit'
import { DetailsSection, FeesSection } from './SectionsBasic'
import { AlertsSection, ThemeSection } from './SectionsExtra'
import { LoyaltySection, TaxSection } from './SectionsMore'
import { HoursSection } from './HoursSection'
import { TablesSection } from './SectionTables'

export default function Settings() {
  const { profile } = useAuth()
    const { row, error, save } = useRestaurant(profile?.restaurant_id)

      if (error) return <div style={{ padding: 24, color: '#b91c1c' }}>{error}</div>
        if (!row) return <div style={{ padding: 24 }}>Loading...</div>

          return (
              <div style={{ padding: 16, maxWidth: 640 }}>
                    <h1 style={{ margin: '0 0 14px' }}>Settings</h1>
                          <DetailsSection row={row} save={save} />
                                <FeesSection row={row} save={save} />
                                <TablesSection row={row} save={save} />
                                      <AlertsSection row={row} save={save} />
                                            <LoyaltySection row={row} save={save} />
                                                  <TaxSection row={row} save={save} />
                                                        <HoursSection row={row} save={save} />
                                                              <ThemeSection row={row} save={save} />
                                                                  </div>
                                                                    )
                                                                    }
                                                                    