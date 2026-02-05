import { Button } from '../ui'

const steps = [
  { id: 'profile', name: 'Profile', description: 'Basic info & timeline' },
  { id: 'mode', name: 'Mode', description: 'Choose your path' },
  { id: 'assumptions', name: 'Assumptions', description: 'Returns & inflation' },
  { id: 'assets', name: 'Assets', description: 'Current savings' },
  { id: 'expenses', name: 'Expenses', description: 'Goals & buckets' },
  { id: 'income', name: 'Income', description: 'Post-retirement income' },
]

export default function StepWizard({
  currentStep,
  onStepChange,
  onNext,
  onPrev,
  onComplete,
  canProceed = true,
  children,
}) {
  const isFirstStep = currentStep === 0
  const isLastStep = currentStep === steps.length - 1

  return (
    <div className="max-w-4xl mx-auto">
      {/* Progress indicator */}
      <nav aria-label="Progress" className="mb-8">
        <ol className="flex items-center">
          {steps.map((step, index) => (
            <li key={step.id} className={`relative ${index !== steps.length - 1 ? 'flex-1' : ''}`}>
              <div className="flex items-center">
                <button
                  onClick={() => index < currentStep && onStepChange(index)}
                  disabled={index > currentStep}
                  className={`
                    relative flex items-center justify-center w-10 h-10 rounded-full text-sm font-medium
                    transition-all duration-200
                    ${index < currentStep 
                      ? 'bg-indigo-600 text-white cursor-pointer hover:bg-indigo-700' 
                      : index === currentStep 
                        ? 'bg-indigo-600 text-white ring-4 ring-indigo-100' 
                        : 'bg-gray-100 text-gray-500 cursor-not-allowed'
                    }
                  `}
                >
                  {index < currentStep ? (
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    index + 1
                  )}
                </button>
                
                {/* Step label - shown on larger screens */}
                <div className="hidden sm:block ml-3">
                  <p className={`text-sm font-medium ${index <= currentStep ? 'text-gray-900' : 'text-gray-500'}`}>
                    {step.name}
                  </p>
                  <p className="text-xs text-gray-500">{step.description}</p>
                </div>
              </div>
              
              {/* Connector line */}
              {index !== steps.length - 1 && (
                <div className="hidden sm:block absolute top-5 left-10 w-full">
                  <div className={`h-0.5 ${index < currentStep ? 'bg-indigo-600' : 'bg-gray-200'}`} />
                </div>
              )}
            </li>
          ))}
        </ol>
        
        {/* Mobile step indicator */}
        <div className="sm:hidden mt-4 text-center">
          <p className="text-sm font-medium text-gray-900">{steps[currentStep].name}</p>
          <p className="text-xs text-gray-500">{steps[currentStep].description}</p>
        </div>
      </nav>

      {/* Step content */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm">
        <div className="p-6 sm:p-8">
          {children}
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between px-6 sm:px-8 py-4 bg-gray-50 rounded-b-2xl border-t border-gray-200">
          <Button
            variant="ghost"
            onClick={onPrev}
            disabled={isFirstStep}
            className={isFirstStep ? 'invisible' : ''}
          >
            <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Previous
          </Button>
          
          <span className="text-sm text-gray-500">
            Step {currentStep + 1} of {steps.length}
          </span>
          
          {isLastStep ? (
            <Button onClick={onComplete} disabled={!canProceed}>
              View Results
              <svg className="w-4 h-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </Button>
          ) : (
            <Button onClick={onNext} disabled={!canProceed}>
              Next
              <svg className="w-4 h-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

export { steps }
