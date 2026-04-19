package sk.gemerbarbier.mapper;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import javax.annotation.processing.Generated;
import sk.gemerbarbier.domain.request.ReservationRequest;
import sk.gemerbarbier.entity.CutService;
import sk.gemerbarbier.entity.Reservation;
import sk.gemerbarbier.entity.ReservationStatus;
import sk.gemerbarbier.model.ReservationAdminResponseDto;
import sk.gemerbarbier.model.ReservationCreateAdminRequestDto;
import sk.gemerbarbier.model.ReservationCreateRequestDto;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2026-04-07T12:42:22+0200",
    comments = "version: 1.5.5.Final, compiler: javac, environment: Java 24 (Oracle Corporation)"
)
public class ReservationMapperImpl implements ReservationMapper {

    @Override
    public Reservation toReservation(ReservationRequest request) {
        if ( request == null ) {
            return null;
        }

        Reservation.ReservationBuilder reservation = Reservation.builder();

        reservation.customerName( request.customerName() );
        reservation.customerEmail( request.customerEmail() );
        reservation.customerPhone( request.customerPhone() );
        reservation.note( request.note() );
        reservation.startTime( request.startTime() );

        return reservation.build();
    }

    @Override
    public ReservationRequest toReservationRequest(ReservationCreateRequestDto requestDto) {
        if ( requestDto == null ) {
            return null;
        }

        String customerName = null;
        String customerEmail = null;
        String customerPhone = null;
        Long barberId = null;
        Long serviceId = null;
        LocalDateTime startTime = null;

        customerName = requestDto.getCustomerName();
        customerEmail = requestDto.getCustomerEmail();
        customerPhone = requestDto.getCustomerPhone();
        barberId = requestDto.getBarberId();
        serviceId = requestDto.getServiceId();
        startTime = requestDto.getStartTime();

        String note = null;

        ReservationRequest reservationRequest = new ReservationRequest( customerName, customerEmail, customerPhone, barberId, serviceId, startTime, note );

        return reservationRequest;
    }

    @Override
    public ReservationRequest toReservationRequest(ReservationCreateAdminRequestDto requestDto) {
        if ( requestDto == null ) {
            return null;
        }

        String customerName = null;
        String customerEmail = null;
        String customerPhone = null;
        Long barberId = null;
        Long serviceId = null;
        LocalDateTime startTime = null;
        String note = null;

        customerName = requestDto.getCustomerName();
        customerEmail = requestDto.getCustomerEmail();
        customerPhone = requestDto.getCustomerPhone();
        barberId = requestDto.getBarberId();
        serviceId = requestDto.getServiceId();
        startTime = requestDto.getStartTime();
        note = requestDto.getNote();

        ReservationRequest reservationRequest = new ReservationRequest( customerName, customerEmail, customerPhone, barberId, serviceId, startTime, note );

        return reservationRequest;
    }

    @Override
    public ReservationAdminResponseDto toReservationAdminResponseDto(Reservation reservation) {
        if ( reservation == null ) {
            return null;
        }

        ReservationAdminResponseDto reservationAdminResponseDto = new ReservationAdminResponseDto();

        reservationAdminResponseDto.setCutServiceName( reservationCutServiceName( reservation ) );
        if ( reservation.getId() != null ) {
            reservationAdminResponseDto.setId( reservation.getId().intValue() );
        }
        if ( reservation.getStartTime() != null ) {
            reservationAdminResponseDto.setStartTime( DateTimeFormatter.ISO_LOCAL_DATE_TIME.format( reservation.getStartTime() ) );
        }
        if ( reservation.getEndTime() != null ) {
            reservationAdminResponseDto.setEndTime( DateTimeFormatter.ISO_LOCAL_DATE_TIME.format( reservation.getEndTime() ) );
        }
        reservationAdminResponseDto.setCustomerName( reservation.getCustomerName() );
        reservationAdminResponseDto.setCustomerEmail( reservation.getCustomerEmail() );
        reservationAdminResponseDto.setCustomerPhone( reservation.getCustomerPhone() );
        reservationAdminResponseDto.setNote( reservation.getNote() );
        reservationAdminResponseDto.setStatus( reservationStatusToStatusEnum( reservation.getStatus() ) );

        return reservationAdminResponseDto;
    }

    private String reservationCutServiceName(Reservation reservation) {
        if ( reservation == null ) {
            return null;
        }
        CutService cutService = reservation.getCutService();
        if ( cutService == null ) {
            return null;
        }
        String name = cutService.getName();
        if ( name == null ) {
            return null;
        }
        return name;
    }

    protected ReservationAdminResponseDto.StatusEnum reservationStatusToStatusEnum(ReservationStatus reservationStatus) {
        if ( reservationStatus == null ) {
            return null;
        }

        ReservationAdminResponseDto.StatusEnum statusEnum;

        switch ( reservationStatus ) {
            case CREATED: statusEnum = ReservationAdminResponseDto.StatusEnum.CREATED;
            break;
            case CANCELLED: statusEnum = ReservationAdminResponseDto.StatusEnum.CANCELLED;
            break;
            default: throw new IllegalArgumentException( "Unexpected enum constant: " + reservationStatus );
        }

        return statusEnum;
    }
}
