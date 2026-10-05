import { Modal } from '../../component/Modal/Modal'
import { useModal } from '../../component/Modal/Modal.hook'
import * as backup from '../../lib/backup'
import type { Notify } from '../../component/Notification/Notification.hook'
import { t } from '../../lib/translation'
import { Switch } from '../../component/Input'
import React from 'react'

type AppCleanerProps = {
  notify: Notify
}
export function AppCleaner(props: AppCleanerProps) {
  const { isOpen, openModal, closeModal } = useModal()

  const handleSubmit = async () => {
    await backup.clearAppData()
    props.notify.setNotification('success', t('all_data_was_deleted'))
    setTimeout(() => window.location.assign('/cofre/get-started'), 10000)
  }

  return <>
    <h3>{t('danger_zone')}</h3>
    <p className='mb-1'>{t('use_with_caution')}</p>
    <button type='button' onClick={openModal}>{t('delete_all_app_data')}</button>
    <Modal open={isOpen} onClose={closeModal}>
      <ClearDataForm onSubmit={handleSubmit} onCancel={closeModal} notify={props.notify} />
    </Modal>
  </>
}

type ClearDataFormElement = HTMLFormElement & {
  readonly elements: HTMLFormControlsCollection & {
    agree: HTMLInputElement,
  }
}
type ClearDataFormProps = {
  onCancel: () => void,
  onSubmit: () => void,
  notify: Notify
}
function ClearDataForm(props: ClearDataFormProps) {
  const handleSubmit = (event: React.FormEvent<ClearDataFormElement>) => {
    event.preventDefault()
    const agree = event.currentTarget.agree.checked

    if (agree !== true) {
      props.notify.setNotification('error', t('need_agree_before_delete'))
      return
    }
    props.onCancel()
    props.onSubmit()
  }

  return <form onSubmit={handleSubmit}>
    <Switch
      defaultChecked={false}
      className='mb-1'
      name='agree'
      title={t('i_agree_to_delete_my_data')}
      description={t('delete_all_app_data_desc')}
    />
    <div className='actionGroup'>
      <button type="button" onClick={props.onCancel}>{t('cancel')}</button>
      <button type="submit">{t('delete')}</button>
    </div>
  </form>
}