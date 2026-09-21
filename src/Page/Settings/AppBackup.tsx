import React from 'react'
import { useNavigate } from 'react-router'
import { Modal } from '../../component/Modal/Modal'
import { Switch } from '../../component/Input'
import { t } from '../../lib/translation'
import { useModal } from '../../component/Modal/Modal.hook'
import * as auth from '../../lib/auth'
import * as backup from '../../lib/backup'
import './AppBackup.css'

type ImportBackupForm = HTMLFormElement & {
  readonly elements: HTMLFormControlsCollection & {
    fileUpload: HTMLInputElement,
  }
}

type ImportBackupProps = {
  onCancel: () => void,
}

function ImportBackup(props: ImportBackupProps) {
  const navigate = useNavigate()
  const [agree, setAgree] = React.useState(false)
  const [message, setMessage] = React.useState('')

  const handleChangeAgreement = () => {
    setAgree(prev => !prev)
  }

  const handleSubmit = async (event: React.FormEvent<ImportBackupForm>) => {
    event.preventDefault()
    const backupFile: File = event.currentTarget.fileUpload.files[0]

    if (backupFile == null) {
      setMessage(() => t('choose_backup_file'))
      return
    }
    if (backupFile.type !== 'application/json') {
      setMessage(() => t('backup_file_must_be_json'))
      return
    }
    if (agree !== true) {
      setMessage(() => t('must_agree_desc'))
      return
    }

    try {
      await backup.restore(backupFile)
      await auth.removeSession()
      navigate('/cofre/login', { replace: true })
      return
    } catch (error) {
      setMessage(() => (error as Error).message)
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

      {message !== '' && <p className='message'>{message}</p>}

      <div className='actions'>
        <button type='button' onClick={props.onCancel}>{t('cancel')}</button>
        <button type='submit'>{t('import')}</button>
      </div>
    </form>
  </>
}

export function AppBackup() {
  const { isOpen, openModal, closeModal } = useModal()

  const handleClickExport = () => {
    const backupFile = backup.createBackup()
    const link = document.createElement('a')
    link.href = URL.createObjectURL(backupFile)
    link.download = backupFile.name
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return <>
    <h3>{t('backup')}</h3>
    <p>{t('backup_desc')}</p>
    <p className='mb-1'>{t('is_recommended_backup_your_data')}</p>

    <div className='actions'>
      <button type='button' onClick={handleClickExport}>{t('export_data')}</button>
      <button type='button' onClick={openModal}>{t('import_data')}</button>
    </div>

    <Modal open={isOpen} onClose={closeModal}>
      <ImportBackup onCancel={closeModal} />
    </Modal>
  </>
}