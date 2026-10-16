import React from 'react'
import { useNavigate } from 'react-router'
import { invoke } from '@tauri-apps/api/core'
import { Modal } from '../../component/Modal/Modal'
import { Switch } from '../../component/Input'
import { t } from '../../lib/translation'
import { useModal } from '../../component/Modal/Modal.hook'
import type { Notify } from '../../component/Notification/Notification.hook'
import './AppBackup.css'

type ImportBackupForm = HTMLFormElement & {
  readonly elements: HTMLFormControlsCollection & {
    fileUpload: HTMLInputElement,
  }
}

type ImportBackupProps = {
  onCancel: () => void,
  notify: Notify,
}

function ImportBackup(props: ImportBackupProps) {
  const [agree, setAgree] = React.useState(false)
  const navigate = useNavigate()

  const handleChangeAgreement = () => {
    setAgree(prev => !prev)
  }

  const handleSubmit = async (event: React.SubmitEvent<ImportBackupForm>) => {
    event.preventDefault()
    const backupFile: File = event.currentTarget.fileUpload.files[0]

    if (backupFile == null) {
      props.notify.setNotification('error', t('choose_backup_file'))
      return
    }
    if (backupFile.type !== 'application/json') {
      props.notify.setNotification('error', t('backup_file_must_be_json'))
      return
    }
    if (agree !== true) {
      props.notify.setNotification('error', t('must_agree_desc'))
      return
    }

    try {
      const data = await backupFile.text()
      await invoke<boolean>('restore_backup', { data })
      navigate('/cofre/logout', { replace: false })
      return
    } catch (error) {
      const message = error instanceof Error
        ? error.message
        : typeof error === 'string' ? error : 'unknown_error'
      props.notify.setNotification('error', message)
    }
  }

  return <>
    <form className='ImportBackup' onSubmit={handleSubmit}>
      <h2>{t('import_backup_file')}</h2>
      <input
        type="file"
        id='fileUpload'
        name='fileUpload'
        className='fileUpload'
        accept='.json,application/json'
      />
      <p>{t('import_backup_file_desc')}</p>
      <Switch
        checked={agree}
        description={t('i_understand_the_risk')}
        onChange={handleChangeAgreement}
      />

      <div className='actionGroup'>
        <button type='button' onClick={props.onCancel}>{t('cancel')}</button>
        <button type='submit'>{t('import')}</button>
      </div>
    </form>
  </>
}

type AppBackupProps = {
  notify: Notify,
}
export function AppBackup(props: AppBackupProps) {
  const { isOpen, openModal, closeModal } = useModal()

  const handleClickExport = async () => {
    try {
      const text = await invoke<string>('create_backup')
      const fileName = `cofre_backup_${Date.now()}.json`
      const file = new Blob([text], { type: 'application/json' })
      const link = document.createElement('a')
      link.href = URL.createObjectURL(file)
      link.download = fileName
      document.body.appendChild(link)
      link.click()
      URL.revokeObjectURL(link.href)
      document.body.removeChild(link)
      const message = (
        <span>
          {t('download_completed')}.<br />
          {t('download_completed_desc')}<br />
          <span className='marked'>{fileName}</span>
        </span>
      )
      props.notify.setNotification('success', message)
    } catch (error) {
      const message = error instanceof Error
        ? error.message
        : typeof error === 'string' ? error : 'unknown_error'
      props.notify.setNotification('error', message)
    }
  }

  return <div className='box'>
    <h3>{t('backup')}</h3>
    <p>{t('backup_desc')}</p>
    <p className='mb-1'>{t('is_recommended_backup_your_data')}</p>
    <div className='actionGroup'>
      <button type='button' onClick={handleClickExport}>{t('export_data')}</button>
      <button type='button' onClick={openModal}>{t('import_data')}</button>
    </div>
    <Modal open={isOpen} onClose={closeModal}>
      <ImportBackup onCancel={closeModal} notify={props.notify} />
    </Modal>
  </div>
}
