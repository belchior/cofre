import React from 'react'
import { Modal } from '../../component/Modal/Modal'
import { Switch } from '../../component/Input'
import { t } from '../../lib/translation'
import { useModal } from '../../component/Modal/Modal.hook'
import * as appManager from '../../lib/appManager'
import * as auth from '../../lib/auth'
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

  const handleChangeAgreement = () => {
    setAgree(prev => !prev)
  }

  const handleSubmit = async (event: React.FormEvent<ImportBackupForm>) => {
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
      await appManager.restore(backupFile)
      await auth.removeSession()
      window.location.assign('/cofre/login')
      return
    } catch (error) {
      props.notify.setNotification('error', (error as Error).message)
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

  const handleClickExport = () => {
    const backupFile = appManager.createBackup()
    const link = document.createElement('a')
    link.href = URL.createObjectURL(backupFile)
    link.download = backupFile.name
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    const message = <span>
      {t('download_completed')}.<br />
      {t('download_completed_desc')}<br />
      <span className='marked'>{backupFile.name}</span>
    </span>
    props.notify.setNotification('success', message)
  }

  return <>
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
  </>
}