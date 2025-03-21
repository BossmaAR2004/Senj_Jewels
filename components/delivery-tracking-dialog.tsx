"use client"

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

interface TrackingInfo {
  carrier: string
  trackingNumber: string
  trackingUrl: string | null
}

interface DeliveryTrackingDialogProps {
  open: boolean
  onCloseAction: () => void
  onSubmitAction: (trackingInfo: TrackingInfo) => void
}

export function DeliveryTrackingDialog({
  open,
  onCloseAction,
  onSubmitAction
}: DeliveryTrackingDialogProps) {
  const [carrier, setCarrier] = useState('')
  const [trackingNumber, setTrackingNumber] = useState('')
  const [trackingUrl, setTrackingUrl] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmitAction({
      carrier,
      trackingNumber,
      trackingUrl: trackingUrl || null
    })
    // Reset form
    setCarrier('')
    setTrackingNumber('')
    setTrackingUrl('')
    onCloseAction()
  }

  return (
    <Dialog open={open} onOpenChange={onCloseAction}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Delivery Tracking</DialogTitle>
          <DialogDescription>
            Enter the delivery tracking details to notify the customer
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="carrier">Carrier</Label>
            <Select value={carrier} onValueChange={setCarrier} required>
              <SelectTrigger>
                <SelectValue placeholder="Select carrier" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="royal-mail">Royal Mail</SelectItem>
                <SelectItem value="dpd">DPD</SelectItem>
                <SelectItem value="dhl">DHL</SelectItem>
                <SelectItem value="ups">UPS</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="tracking">Tracking Number</Label>
            <Input
              id="tracking"
              value={trackingNumber}
              onChange={(e) => setTrackingNumber(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="url">Tracking URL (optional)</Label>
            <Input
              id="url"
              type="url"
              value={trackingUrl}
              onChange={(e) => setTrackingUrl(e.target.value)}
              placeholder="https://"
            />
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={onCloseAction}>
              Cancel
            </Button>
            <Button type="submit">
              Save & Send Notification
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}