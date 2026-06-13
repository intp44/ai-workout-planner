import { useState, useEffect } from 'react';
import { getAuthToken, analyzeInBodyImage, saveInBodyRecord, updateInBodyRecord, getLatestInBodyRecord, getInBodyRecordHistory, deleteInBodyRecord } from './api';
import './InBodyPage.css';

export default function InBodyPage() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState(''); // 'success', 'error', 'info'
  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState('');
  const [extractedData, setExtractedData] = useState(null);
  const [formData, setFormData] = useState({
    recordDate: new Date().toISOString().split('T')[0],
    bodyFatPercent: '',
    muscleMassKg: '',
    bmi: '',
    basalMetabolicRate: '',
    visceralFatLevel: '',
    notes: '',
  });
  const [recordId, setRecordId] = useState(null);
  const [history, setHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    loadLatestRecord();
  }, []);

  const loadLatestRecord = async () => {
    try {
      const token = getAuthToken();
      const data = await getLatestInBodyRecord(token);
      if (data && data.data) {
        const record = data.data;
        setRecordId(record.id);
        setFormData({
          recordDate: record.recordDate,
          bodyFatPercent: record.bodyFatPercent || '',
          muscleMassKg: record.muscleMassKg || '',
          bmi: record.bmi || '',
          basalMetabolicRate: record.basalMetabolicRate || '',
          visceralFatLevel: record.visceralFatLevel || '',
          notes: record.notes || '',
        });
      }
    } catch (error) {
      console.error('최근 기록 로드 실패:', error);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreview(e.target?.result);
      };
      reader.readAsDataURL(file);
      setMessage('');
    }
  };

  const handleAnalyzeImage = async () => {
    if (!imageFile) {
      setMessage('이미지를 선택해주세요.');
      setMessageType('error');
      return;
    }

    setLoading(true);
    setMessage('');
    try {
      const token = getAuthToken();
      const result = await analyzeInBodyImage(token, imageFile);

      setExtractedData(result);
      setFormData({
        ...formData,
        bodyFatPercent: result.bodyFatPercent || '',
        muscleMassKg: result.muscleMassKg || '',
        bmi: result.bmi || '',
        basalMetabolicRate: result.basalMetabolicRate || '',
        visceralFatLevel: result.visceralFatLevel || '',
      });

      setMessage('이미지 분석이 완료되었습니다. 수치를 확인하고 수정한 후 저장해주세요.');
      setMessageType('success');
    } catch (error) {
      setMessage('이미지 분석 중 오류가 발생했습니다: ' + error.message);
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value === '' ? '' : value,
    });
  };

  const handleSaveRecord = async () => {
    if (!formData.bodyFatPercent && !formData.muscleMassKg && !formData.bmi && !formData.basalMetabolicRate) {
      setMessage('최소한 하나의 수치를 입력해주세요.');
      setMessageType('error');
      return;
    }

    setLoading(true);
    setMessage('');
    try {
      const token = getAuthToken();
      const dataToSave = {
        recordDate: formData.recordDate,
        bodyFatPercent: formData.bodyFatPercent ? parseFloat(formData.bodyFatPercent) : null,
        muscleMassKg: formData.muscleMassKg ? parseFloat(formData.muscleMassKg) : null,
        bmi: formData.bmi ? parseFloat(formData.bmi) : null,
        basalMetabolicRate: formData.basalMetabolicRate ? parseInt(formData.basalMetabolicRate) : null,
        visceralFatLevel: formData.visceralFatLevel ? parseInt(formData.visceralFatLevel) : null,
        notes: formData.notes,
      };

      if (recordId) {
        await updateInBodyRecord(token, recordId, dataToSave);
      } else {
        const result = await saveInBodyRecord(token, dataToSave);
        if (result.data) {
          setRecordId(result.data.id);
        }
      }

      setMessage('인바디 기록이 저장되었습니다.');
      setMessageType('success');
      setImageFile(null);
      setPreview('');
      setExtractedData(null);

      // 페이지 새로고침
      setTimeout(() => loadLatestRecord(), 1000);
    } catch (error) {
      setMessage('저장 중 오류가 발생했습니다: ' + error.message);
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  const loadHistory = async () => {
    try {
      const token = getAuthToken();
      const data = await getInBodyRecordHistory(token);
      if (data?.data) {
        setHistory(data.data);
        setShowHistory(true);
      }
    } catch (error) {
      console.error('기록 로드 실패:', error);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('이 기록을 삭제하시겠습니까?')) return;
    try {
      const token = getAuthToken();
      await deleteInBodyRecord(token, id);
      setHistory((prev) => prev.filter((r) => r.id !== id));
      setMessage('기록이 삭제되었습니다.');
      setMessageType('success');
    } catch (error) {
      setMessage('삭제 중 오류가 발생했습니다: ' + error.message);
      setMessageType('error');
    }
  };

  return (
    <div className="inbody-page">
      <h1>인바디 관리</h1>

      {message && (
        <div className={`message message-${messageType}`}>
          {message}
        </div>
      )}

      <div className="inbody-container">
        {/* 이미지 업로드 섹션 */}
        <div className="upload-section">
          <h2>인바디 사진 업로드</h2>
          <div className="file-input-wrapper">
            <label htmlFor="imageInput" className="file-input-label">
              {preview ? '다른 사진 선택' : '사진 선택'}
            </label>
            <input
              id="imageInput"
              type="file"
              accept="image/jpeg,image/png"
              onChange={handleImageChange}
              disabled={loading}
            />
          </div>

          {preview && (
            <div className="preview-container">
              <img src={preview} alt="미리보기" className="preview-image" />
              <button
                onClick={handleAnalyzeImage}
                disabled={loading}
                className="btn btn-primary"
              >
                {loading ? '분석 중...' : 'AI로 수치 추출'}
              </button>
            </div>
          )}
        </div>

        {/* 수치 입력 섹션 */}
        <div className="data-section">
          <h2>인바디 수치</h2>
          <div className="form-group">
            <label htmlFor="recordDate">측정 날짜</label>
            <input
              id="recordDate"
              type="date"
              name="recordDate"
              value={formData.recordDate}
              onChange={handleFormChange}
            />
          </div>

          <div className="metrics-grid">
            <div className="form-group">
              <label htmlFor="bodyFatPercent">
                체지방률 (%)
                {extractedData && <span className="extracted-badge">추출됨</span>}
              </label>
              <input
                id="bodyFatPercent"
                type="number"
                name="bodyFatPercent"
                value={formData.bodyFatPercent}
                onChange={handleFormChange}
                placeholder="예: 25.5"
                step="0.1"
              />
            </div>

            <div className="form-group">
              <label htmlFor="muscleMassKg">
                근육량 (kg)
                {extractedData && <span className="extracted-badge">추출됨</span>}
              </label>
              <input
                id="muscleMassKg"
                type="number"
                name="muscleMassKg"
                value={formData.muscleMassKg}
                onChange={handleFormChange}
                placeholder="예: 45.2"
                step="0.1"
              />
            </div>

            <div className="form-group">
              <label htmlFor="bmi">
                BMI
                {extractedData && <span className="extracted-badge">추출됨</span>}
              </label>
              <input
                id="bmi"
                type="number"
                name="bmi"
                value={formData.bmi}
                onChange={handleFormChange}
                placeholder="예: 24.5"
                step="0.1"
              />
            </div>

            <div className="form-group">
              <label htmlFor="basalMetabolicRate">
                기초대사량 (kcal)
                {extractedData && <span className="extracted-badge">추출됨</span>}
              </label>
              <input
                id="basalMetabolicRate"
                type="number"
                name="basalMetabolicRate"
                value={formData.basalMetabolicRate}
                onChange={handleFormChange}
                placeholder="예: 1600"
              />
            </div>

            <div className="form-group">
              <label htmlFor="visceralFatLevel">내장지방 수치</label>
              <input
                id="visceralFatLevel"
                type="number"
                name="visceralFatLevel"
                value={formData.visceralFatLevel}
                onChange={handleFormChange}
                placeholder="예: 8"
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="notes">메모</label>
            <textarea
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleFormChange}
              placeholder="추가 메모를 입력하세요."
              rows={4}
            />
          </div>

          <button
            onClick={handleSaveRecord}
            disabled={loading}
            className="btn btn-success"
          >
            {loading ? '저장 중...' : '저장'}
          </button>

          <button
            onClick={loadHistory}
            className="btn btn-secondary"
          >
            기록 조회
          </button>
        </div>

        {/* 기록 조회 섹션 */}
        {showHistory && history.length > 0 && (
          <div className="history-section">
            <h2>측정 기록</h2>
            <table className="history-table">
              <thead>
                <tr>
                  <th>날짜</th>
                  <th>체지방률</th>
                  <th>근육량</th>
                  <th>BMI</th>
                  <th>기초대사량</th>
                  <th>내장지방</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {history.map((record) => (
                  <tr key={record.id}>
                    <td>{record.recordDate}</td>
                    <td>{record.bodyFatPercent ? `${record.bodyFatPercent}%` : '-'}</td>
                    <td>{record.muscleMassKg ? `${record.muscleMassKg}kg` : '-'}</td>
                    <td>{record.bmi ?? '-'}</td>
                    <td>{record.basalMetabolicRate ?? '-'}</td>
                    <td>{record.visceralFatLevel ?? '-'}</td>
                    <td>
                      <button
                        className="btn-delete-record"
                        onClick={() => handleDelete(record.id)}
                      >
                        삭제
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
