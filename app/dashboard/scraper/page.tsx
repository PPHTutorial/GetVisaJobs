'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Play, Pause, Settings, BarChart3, AlertCircle } from 'lucide-react'

interface ScraperConfig {
  linkedinEmail: string
  linkedinPassword: string
  locations: string[]
  scrapeTypes: string[]
  maxPages: number
  delayBetweenRequests: number
  isRunning: boolean
  progress: {
    jobs: number
    events: number
    people: number
    articles: number
  }
  lastRun: string | null
}

const AVAILABLE_LOCATIONS = [
  'United States', 'United Kingdom', 'Canada', 'Australia', 'Germany', 'France',
  'Netherlands', 'Sweden', 'Norway', 'Denmark', 'Italy', 'Spain', 'Portugal',
  'Ireland', 'Belgium', 'Switzerland', 'Austria', 'Finland', 'Poland', 'Czech Republic',
  'Hungary', 'Slovakia', 'Slovenia', 'Croatia', 'Romania', 'Bulgaria', 'Greece',
  'Turkey', 'Russia', 'Ukraine', 'Belarus', 'Moldova', 'Georgia', 'Armenia', 'Azerbaijan',
  'Kazakhstan', 'Uzbekistan', 'Turkmenistan', 'Kyrgyzstan', 'Tajikistan', 'Japan',
  'South Korea', 'China', 'India', 'Pakistan', 'Bangladesh', 'Sri Lanka', 'Nepal',
  'Bhutan', 'Maldives', 'Thailand', 'Vietnam', 'Cambodia', 'Laos', 'Myanmar', 'Malaysia',
  'Singapore', 'Indonesia', 'Philippines', 'Brunei', 'East Timor', 'New Zealand',
  'Fiji', 'Papua New Guinea', 'Solomon Islands', 'Vanuatu', 'Samoa', 'Tonga',
  'Kiribati', 'Tuvalu', 'Nauru', 'Marshall Islands', 'Micronesia', 'Palau',
  'Mexico', 'Guatemala', 'Belize', 'El Salvador', 'Honduras', 'Nicaragua', 'Costa Rica',
  'Panama', 'Colombia', 'Venezuela', 'Guyana', 'Suriname', 'Ecuador', 'Peru', 'Brazil',
  'Bolivia', 'Paraguay', 'Chile', 'Argentina', 'Uruguay', 'Egypt', 'Libya', 'Tunisia',
  'Algeria', 'Morocco', 'Western Sahara', 'Mauritania', 'Mali', 'Niger', 'Chad',
  'Sudan', 'Eritrea', 'Djibouti', 'Ethiopia', 'Somalia', 'Kenya', 'Tanzania', 'Uganda',
  'Rwanda', 'Burundi', 'South Sudan', 'Zimbabwe', 'Zambia', 'Malawi', 'Mozambique',
  'Botswana', 'Namibia', 'South Africa', 'Lesotho', 'Swaziland', 'Angola', 'Congo',
  'Gabon', 'Cameroon', 'Central African Republic', 'Equatorial Guinea', 'São Tomé and Príncipe',
  'Nigeria', 'Benin', 'Togo', 'Ghana', 'Côte d\'Ivoire', 'Liberia', 'Sierra Leone',
  'Guinea', 'Guinea-Bissau', 'Gambia', 'Senegal', 'Burkina Faso', 'Cape Verde',
  'Saudi Arabia', 'Iraq', 'Iran', 'Jordan', 'Lebanon', 'Syria', 'Israel', 'Palestine',
  'United Arab Emirates', 'Oman', 'Yemen', 'Qatar', 'Bahrain', 'Kuwait'
]

const SCRAPE_TYPES = [
  { id: 'jobs', label: 'Jobs', description: 'Visa-sponsored job listings' },
  { id: 'events', label: 'Events', description: 'Networking and job events' },
  { id: 'people', label: 'People', description: 'Professional profiles' },
  { id: 'articles', label: 'Articles', description: 'Blog posts and articles' }
]

export default function ScraperDashboard() {
  const [config, setConfig] = useState<ScraperConfig>({
    linkedinEmail: '',
    linkedinPassword: '',
    locations: ['United States', 'United Kingdom'],
    scrapeTypes: ['jobs', 'events'],
    maxPages: 50,
    delayBetweenRequests: 2000,
    isRunning: false,
    progress: { jobs: 0, events: 0, people: 0, articles: 0 },
    lastRun: null
  })

  const [stats, setStats] = useState({
    totalJobs: 0,
    totalEvents: 0,
    totalPeople: 0,
    totalArticles: 0
  })

  useEffect(() => {
    // Load saved config from localStorage
    const savedConfig = localStorage.getItem('scraperConfig')
    if (savedConfig) {
      setConfig(prev => ({ ...prev, ...JSON.parse(savedConfig) }))
    }

    // Load stats
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const [jobsRes, eventsRes, usersRes, blogsRes] = await Promise.all([
        fetch('/api/dashboard/jobs?status=active'),
        fetch('/api/dashboard/events'),
        fetch('/api/dashboard/users'),
        fetch('/api/dashboard/blogs')
      ])

      const jobs = await jobsRes.json()
      const events = await eventsRes.json()
      const users = await usersRes.json()
      const blogs = await blogsRes.json()

      setStats({
        totalJobs: jobs.total || 0,
        totalEvents: events.total || 0,
        totalPeople: users.total || 0,
        totalArticles: blogs.total || 0
      })
    } catch (error) {
      console.error('Error fetching stats:', error)
    }
  }

  const handleLocationToggle = (location: string) => {
    setConfig(prev => ({
      ...prev,
      locations: prev.locations.includes(location)
        ? prev.locations.filter(l => l !== location)
        : [...prev.locations, location]
    }))
  }

  const handleTypeToggle = (type: string) => {
    setConfig(prev => ({
      ...prev,
      scrapeTypes: prev.scrapeTypes.includes(type)
        ? prev.scrapeTypes.filter(t => t !== type)
        : [...prev.scrapeTypes, type]
    }))
  }

  const saveConfig = () => {
    const { isRunning: _, progress: __, ...configToSave } = config
    localStorage.setItem('scraperConfig', JSON.stringify(configToSave))
    alert('Configuration saved!')
  }

  const startScraper = async () => {
    setConfig(prev => ({ ...prev, isRunning: true, progress: { jobs: 0, events: 0, people: 0, articles: 0 } }))

    try {
      const response = await fetch('/api/scraper/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config)
      })

      if (response.ok) {
        // Poll for progress
        const pollInterval = setInterval(async () => {
          const progressRes = await fetch('/api/scraper/progress')
          if (progressRes.ok) {
            const progress = await progressRes.json()
            setConfig(prev => ({ ...prev, progress }))

            if (progress.completed) {
              clearInterval(pollInterval)
              setConfig(prev => ({ ...prev, isRunning: false, lastRun: new Date().toISOString() }))
              fetchStats()
            }
          }
        }, 5000)
      }
    } catch (error) {
      console.error('Error starting scraper:', error)
      setConfig(prev => ({ ...prev, isRunning: false }))
    }
  }

  const stopScraper = async () => {
    await fetch('/api/scraper/stop', { method: 'POST' })
    setConfig(prev => ({ ...prev, isRunning: false }))
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">LinkedIn Scraper Dashboard</h1>
          <p className="text-gray-600 mt-2">Configure and manage automated LinkedIn data scraping</p>
        </div>

        <Tabs defaultValue="config" className="space-y-6">
          <TabsList>
            <TabsTrigger value="config">Configuration</TabsTrigger>
            <TabsTrigger value="progress">Progress</TabsTrigger>
            <TabsTrigger value="stats">Statistics</TabsTrigger>
          </TabsList>

          <TabsContent value="config" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Settings className="w-5 h-5 mr-2" />
                  LinkedIn Credentials
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={config.linkedinEmail}
                      onChange={(e) => setConfig(prev => ({ ...prev, linkedinEmail: e.target.value }))}
                      placeholder="your-email@example.com"
                    />
                  </div>
                  <div>
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      value={config.linkedinPassword}
                      onChange={(e) => setConfig(prev => ({ ...prev, linkedinPassword: e.target.value }))}
                      placeholder="••••••••"
                    />
                  </div>
                </div>
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Credentials are stored locally and used only for LinkedIn authentication.
                    Never share your LinkedIn password.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Scrape Types</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {SCRAPE_TYPES.map(type => (
                    <div key={type.id} className="flex items-start space-x-3">
                      <Checkbox
                        id={type.id}
                        checked={config.scrapeTypes.includes(type.id)}
                        onCheckedChange={() => handleTypeToggle(type.id)}
                      />
                      <div className="grid gap-1.5 leading-none">
                        <Label htmlFor={type.id} className="text-sm font-medium">
                          {type.label}
                        </Label>
                        <p className="text-xs text-gray-500">{type.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Locations</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <Label>Selected Locations ({config.locations.length})</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {config.locations.map(location => (
                      <Badge key={location} variant="secondary" className="cursor-pointer"
                             onClick={() => handleLocationToggle(location)}>
                        {location} ×
                      </Badge>
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 max-h-60 overflow-y-auto">
                  {AVAILABLE_LOCATIONS.map(location => (
                    <div key={location} className="flex items-center space-x-2">
                      <Checkbox
                        id={location}
                        checked={config.locations.includes(location)}
                        onCheckedChange={() => handleLocationToggle(location)}
                      />
                      <Label htmlFor={location} className="text-sm">{location}</Label>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Advanced Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="maxPages">Max Pages per Type/Location</Label>
                    <Input
                      id="maxPages"
                      type="number"
                      value={config.maxPages}
                      onChange={(e) => setConfig(prev => ({ ...prev, maxPages: parseInt(e.target.value) }))}
                      min="1"
                      max="500"
                    />
                  </div>
                  <div>
                    <Label htmlFor="delay">Delay Between Requests (ms)</Label>
                    <Input
                      id="delay"
                      type="number"
                      value={config.delayBetweenRequests}
                      onChange={(e) => setConfig(prev => ({ ...prev, delayBetweenRequests: parseInt(e.target.value) }))}
                      min="1000"
                      max="10000"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-between">
              <Button onClick={saveConfig} variant="outline">
                Save Configuration
              </Button>
              <div className="space-x-2">
                {config.isRunning ? (
                  <Button onClick={stopScraper} variant="destructive">
                    <Pause className="w-4 h-4 mr-2" />
                    Stop Scraper
                  </Button>
                ) : (
                  <Button onClick={startScraper} disabled={!config.linkedinEmail || !config.linkedinPassword}>
                    <Play className="w-4 h-4 mr-2" />
                    Start Scraper
                  </Button>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="progress" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BarChart3 className="w-5 h-5 mr-2" />
                  Scraping Progress
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {config.isRunning && (
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      Scraper is running. Progress updates every 5 seconds.
                    </AlertDescription>
                  </Alert>
                )}

                {Object.entries(config.progress).map(([type, progress]) => (
                  <div key={type}>
                    <div className="flex justify-between mb-2">
                      <Label className="capitalize">{type}</Label>
                      <span className="text-sm text-gray-500">{progress}%</span>
                    </div>
                    <Progress value={progress} />
                  </div>
                ))}

                {config.lastRun && (
                  <div className="text-sm text-gray-500">
                    Last run: {new Date(config.lastRun).toLocaleString()}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="stats" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Total Jobs</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalJobs}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Total Events</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalEvents}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Total People</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalPeople}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Total Articles</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalArticles}</div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}