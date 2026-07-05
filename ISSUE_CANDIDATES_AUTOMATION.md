# Issue Candidates for HELPDESK.AI

## Issue 1
- **Title**: test : add unit tests for DuplicateService check_duplicate method
- **Type**: test
- **Files to create**: backend/tests/test_duplicate_service.py
- **Summary**: Add unit tests for check_duplicate method covering threshold override, empty ticket store, and degraded mode
- **Verification**: `pytest backend/tests/test_duplicate_service.py -v`
- **Conflict Risk**: Low

## Issue 2
- **Title**: test : add unit tests for DuplicateService add_ticket method
- **Type**: test
- **Files to create**: backend/tests/test_duplicate_service_add.py
- **Summary**: Add unit tests for add_ticket method covering ticket creation and disk persistence
- **Verification**: `pytest backend/tests/test_duplicate_service_add.py -v`
- **Conflict Risk**: Low

## Issue 3
- **Title**: fix : handle empty text in check_duplicate method
- **Type**: fix
- **Files to modify**: backend/services/duplicate_service.py
- **Summary**: Handle empty/whitespace text in check_duplicate to avoid unnecessary model calls
- **Verification**: `pytest backend/tests/ -v`
- **Conflict Risk**: Low

## Issue 4
- **Title**: feat : add threshold validation in check_duplicate method
- **Type**: feat
- **Files to modify**: backend/services/duplicate_service.py
- **Summary**: Add validation that threshold is between 0 and 1
- **Verification**: `pytest backend/tests/ -v`
- **Conflict Risk**: Low

## Issue 5
- **Title**: test : add unit tests for classifier_v3 predict method edge cases
- **Type**: test
- **Files to create**: backend/tests/test_classifier_v3.py
- **Summary**: Add unit tests for classifier_v3 covering None confidence and empty text input
- **Verification**: `pytest backend/tests/test_classifier_v3.py -v`
- **Conflict Risk**: Low

## Issue 6
- **Title**: fix : handle None values in notification_routing service
- **Type**: fix
- **Files to modify**: backend/services/notification_routing.py
- **Summary**: Add null checks for category and priority in notification routing
- **Verification**: `pytest backend/tests/ -v`
- **Conflict Risk**: Low

## Issue 7
- **Title**: test : add unit tests for notification_routing get_route method
- **Type**: test
- **Files to create**: backend/tests/test_notification_routing.py
- **Summary**: Add unit tests for get_route covering priority-based routing and channel selection
- **Verification**: `pytest backend/tests/test_notification_routing.py -v`
- **Conflict Risk**: Low

## Issue 8
- **Title**: fix : handle missing env vars gracefully in gemini_service
- **Type**: fix
- **Files to modify**: backend/services/gemini_service.py
- **Summary**: Return graceful response instead of raising exception when API key is missing
- **Verification**: `pytest backend/tests/ -v`
- **Conflict Risk**: Low

## Issue 9
- **Title**: test : add unit tests for gemini_service generate_response method
- **Type**: test
- **Files to create**: backend/tests/test_gemini_service.py
- **Summary**: Add unit tests for generate_response covering API key missing and fallback scenarios
- **Verification**: `pytest backend/tests/test_gemini_service.py -v`
- **Conflict Risk**: Low

## Issue 10
- **Title**: fix : add input validation to ocr_service process_document method
- **Type**: fix
- **Files to modify**: backend/services/ocr_service.py
- **Summary**: Add validation for file path existence and supported formats
- **Verification**: `pytest backend/tests/ -v`
- **Conflict Risk**: Low