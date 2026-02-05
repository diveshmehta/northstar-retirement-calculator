import { useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { usePlanStore } from '../store/planStore'
import { useCalculations } from '../hooks/useCalculations'
import StepWizard from '../components/wizard/StepWizard'
import ProfileForm from '../components/forms/ProfileForm'
import ModeSelector from '../components/forms/ModeSelector'
import AssumptionsForm from '../components/forms/AssumptionsForm'
import AssetsForm from '../components/forms/AssetsForm'
import ExpensesForm from '../components/forms/ExpensesForm'
import IncomeForm from '../components/forms/IncomeForm'

export default function Calculator() {
  const navigate = useNavigate()
  const { planId } = useParams()
  const { currentStep, setStep, nextStep, prevStep, loadPlan, setResults } = usePlanStore()
  const { calculate } = useCalculations()

  // Load plan if planId is provided
  useEffect(() => {
    if (planId) {
      loadPlan(planId)
    }
  }, [planId, loadPlan])

  const handleComplete = () => {
    // Calculate results
    const results = calculate()
    if (results) {
      setResults(results)
      navigate('/results')
    }
  }

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return <ProfileForm />
      case 1:
        return <ModeSelector />
      case 2:
        return <AssumptionsForm />
      case 3:
        return <AssetsForm />
      case 4:
        return <ExpensesForm />
      case 5:
        return <IncomeForm />
      default:
        return <ProfileForm />
    }
  }

  return (
    <div className="py-4">
      <StepWizard
        currentStep={currentStep}
        onStepChange={setStep}
        onNext={nextStep}
        onPrev={prevStep}
        onComplete={handleComplete}
      >
        {renderStep()}
      </StepWizard>
    </div>
  )
}
