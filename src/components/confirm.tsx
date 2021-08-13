/** @jsxImportSource @emotion/react */

import { css } from '@emotion/react'
import * as AlertDialog from '@radix-ui/react-alert-dialog'
import Button from './button'

export default function ConfirmDialog({
  title,
  description,
  action,
  trigger,
  onConfirm,
}: {
  title: string
  description: string
  action: string
  trigger: React.ReactNode
  onConfirm: () => void
}) {
  return (
    <AlertDialog.Root>
      <AlertDialog.Trigger>{trigger}</AlertDialog.Trigger>
      <AlertDialog.Overlay
        css={css`
          background: rgba(0, 0, 0, 0.1);
          backdrop-filter: blur(0.2rem);
          position: fixed;
          inset: 0;
        `}
      />
      <AlertDialog.Content
        css={css`
          border-radius: 0.5rem;

          position: fixed;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);

          img {
            height: 80vh;
          }
        `}
      >
        <AlertDialog.Title>{title}</AlertDialog.Title>
        <AlertDialog.Description>{description}</AlertDialog.Description>

        <div
          css={css`
            display: flex;
            button:first-of-type {
              margin-left: auto;
              margin-right: 1.5rem;
            }
          `}
        >
          <AlertDialog.Cancel as={Button}>Cancel</AlertDialog.Cancel>
          <AlertDialog.Action as={Button} onClick={onConfirm}>
            {action}
          </AlertDialog.Action>
        </div>
      </AlertDialog.Content>
    </AlertDialog.Root>
  )
}
